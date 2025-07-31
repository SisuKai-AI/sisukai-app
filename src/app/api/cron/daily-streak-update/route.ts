import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  calculateStreak,
  qualifiesForDailyActivity,
  calculateDailyActivitySummary,
  getStreakMilestoneReward,
  StreakData
} from '@/lib/streak-calculation'

// This endpoint will be called by Vercel Cron Job daily
// Add to vercel.json: 
// {
//   "crons": [
//     {
//       "path": "/api/cron/daily-streak-update",
//       "schedule": "0 0 * * *"
//     }
//   ]
// }

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting daily streak update job...')
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get all users with active streaks or recent activity
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        current_streak,
        longest_streak,
        last_activity_date,
        streak_freeze_count,
        last_streak_freeze_date,
        subscription_tier,
        total_xp
      `)
      .or('current_streak.gt.0,last_activity_date.gte.' + yesterdayStr)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    console.log(`Processing ${users?.length || 0} users for streak updates...`)

    let processedUsers = 0
    let streaksUpdated = 0
    let streaksBroken = 0
    let milestonesAwarded = 0
    const errors: string[] = []

    if (users) {
      for (const user of users) {
        try {
          await processUserStreak(user, todayStr, yesterdayStr)
          processedUsers++
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error)
          errors.push(`User ${user.id}: ${error}`)
        }
      }
    }

    // Log summary
    console.log(`Daily streak update completed:`)
    console.log(`- Users processed: ${processedUsers}`)
    console.log(`- Streaks updated: ${streaksUpdated}`)
    console.log(`- Streaks broken: ${streaksBroken}`)
    console.log(`- Milestones awarded: ${milestonesAwarded}`)
    console.log(`- Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      summary: {
        users_processed: processedUsers,
        streaks_updated: streaksUpdated,
        streaks_broken: streaksBroken,
        milestones_awarded: milestonesAwarded,
        errors: errors.length
      },
      errors: errors.slice(0, 10) // Return first 10 errors
    })

  } catch (error) {
    console.error('Error in daily streak update cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processUserStreak(
  user: any,
  todayStr: string,
  yesterdayStr: string
): Promise<void> {
  const userId = user.id

  // Get yesterday's activities to check if user was active
  const { data: yesterdayActivities, error: activitiesError } = await supabase
    .from('xp_activities')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', `${yesterdayStr}T00:00:00.000Z`)
    .lt('created_at', `${yesterdayStr}T23:59:59.999Z`)

  if (activitiesError) {
    throw new Error(`Failed to fetch activities: ${activitiesError.message}`)
  }

  // Calculate yesterday's activity summary
  const yesterdayDate = new Date(yesterdayStr)
  const dailySummary = calculateDailyActivitySummary(yesterdayActivities || [], yesterdayDate)
  
  // Check if user qualified for daily activity yesterday
  const qualifiedYesterday = qualifiesForDailyActivity(
    dailySummary.questions_answered,
    dailySummary.lessons_completed,
    dailySummary.xp_earned,
    0 // We don't track time spent yet
  )

  const currentStreakData: StreakData = {
    current_streak: user.current_streak || 0,
    longest_streak: user.longest_streak || 0,
    last_activity_date: user.last_activity_date,
    streak_freeze_count: user.streak_freeze_count || 0,
    last_streak_freeze_date: user.last_streak_freeze_date
  }

  // Calculate new streak based on yesterday's activity
  const lastActivityDate = qualifiedYesterday ? yesterdayDate : null
  const streakResult = calculateStreak(currentStreakData, lastActivityDate, new Date(todayStr))

  // Prepare update data
  const updateData: any = {
    current_streak: streakResult.current_streak,
    longest_streak: streakResult.longest_streak
  }

  // Update last activity date if user was active yesterday
  if (qualifiedYesterday) {
    updateData.last_activity_date = yesterdayStr
  }

  // Update user profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`)
  }

  // Check for milestone rewards if streak was extended
  if (streakResult.streak_extended && qualifiedYesterday) {
    const milestone = getStreakMilestoneReward(streakResult.current_streak)
    
    if (milestone.is_milestone) {
      // Award milestone reward
      if (milestone.reward_type === 'xp' && milestone.reward_amount) {
        // Add XP activity
        await supabase
          .from('xp_activities')
          .insert({
            user_id: userId,
            xp_amount: milestone.reward_amount,
            activity_type: 'streak_bonus',
            activity_details: {
              milestone_name: milestone.milestone_name,
              streak_days: streakResult.current_streak,
              awarded_by: 'daily_cron'
            },
            created_at: new Date().toISOString()
          })

        // Update user's total XP
        await supabase.rpc('increment_user_xp', {
          user_id_param: userId,
          xp_amount: milestone.reward_amount
        })
      }

      // Record achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_type: 'streak_milestone',
          achievement_data: {
            milestone_name: milestone.milestone_name,
            streak_days: streakResult.current_streak,
            reward_type: milestone.reward_type,
            reward_amount: milestone.reward_amount,
            awarded_by: 'daily_cron'
          },
          created_at: new Date().toISOString()
        })

      console.log(`Awarded milestone "${milestone.milestone_name}" to user ${userId}`)
    }
  }

  // Log significant changes
  if (streakResult.streak_broken) {
    console.log(`Streak broken for user ${userId}: ${currentStreakData.current_streak} -> ${streakResult.current_streak}`)
  } else if (streakResult.streak_extended) {
    console.log(`Streak extended for user ${userId}: ${currentStreakData.current_streak} -> ${streakResult.current_streak}`)
  }
}

// POST endpoint for manual testing (not used by cron)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_date, user_ids } = body

    if (!test_date) {
      return NextResponse.json(
        { error: 'test_date is required for manual testing' },
        { status: 400 }
      )
    }

    const testDate = new Date(test_date)
    const testDateStr = testDate.toISOString().split('T')[0]
    const previousDateStr = new Date(testDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let usersToProcess
    if (user_ids && user_ids.length > 0) {
      // Process specific users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          current_streak,
          longest_streak,
          last_activity_date,
          streak_freeze_count,
          last_streak_freeze_date,
          subscription_tier
        `)
        .in('id', user_ids)

      if (usersError) {
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }

      usersToProcess = users
    } else {
      // Process all users (for testing)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          current_streak,
          longest_streak,
          last_activity_date,
          streak_freeze_count,
          last_streak_freeze_date,
          subscription_tier
        `)
        .limit(10) // Limit for testing

      if (usersError) {
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }

      usersToProcess = users
    }

    const results = []
    for (const user of usersToProcess || []) {
      try {
        await processUserStreak(user, testDateStr, previousDateStr)
        results.push({ user_id: user.id, status: 'success' })
      } catch (error) {
        results.push({ 
          user_id: user.id, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      test_date: testDateStr,
      users_processed: results.length,
      results
    })

  } catch (error) {
    console.error('Error in manual streak update test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

