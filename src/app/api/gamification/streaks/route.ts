import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  calculateStreak,
  qualifiesForDailyActivity,
  canUseStreakFreeze,
  getStreakMilestoneReward,
  getStreakStatusDescription,
  calculateDailyActivitySummary,
  getNextStreakMilestone,
  StreakData
} from '@/lib/streak-calculation'

interface UpdateStreakRequest {
  user_id: string
  activity_date?: string
  force_update?: boolean
}

interface UseStreakFreezeRequest {
  user_id: string
}

// GET: Retrieve user streak information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Get user's current streak data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        current_streak,
        longest_streak,
        last_activity_date,
        streak_freeze_count,
        last_streak_freeze_date,
        subscription_tier
      `)
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const streakData: StreakData = {
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_activity_date: profile?.last_activity_date,
      streak_freeze_count: profile?.streak_freeze_count || 0,
      last_streak_freeze_date: profile?.last_streak_freeze_date
    }

    // Get today's activity to check if user has been active
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    const { data: todayActivities, error: activitiesError } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', `${todayStr}T00:00:00.000Z`)
      .lt('created_at', `${todayStr}T23:59:59.999Z`)

    if (activitiesError) {
      console.error('Error fetching today activities:', activitiesError)
    }

    // Calculate if user qualifies for daily activity
    const dailySummary = calculateDailyActivitySummary(todayActivities || [], today)
    const qualifiesForDaily = qualifiesForDailyActivity(
      dailySummary.questions_answered,
      dailySummary.lessons_completed,
      dailySummary.xp_earned,
      0 // We don't track time spent yet
    )

    // Get streak status
    const statusInfo = getStreakStatusDescription(
      streakData.current_streak,
      qualifiesForDaily ? todayStr : streakData.last_activity_date
    )

    // Get streak freeze eligibility
    const freezeInfo = canUseStreakFreeze(
      streakData,
      profile?.subscription_tier || 'free'
    )

    // Get next milestone
    const nextMilestone = getNextStreakMilestone(streakData.current_streak)

    // Check for current milestone
    const milestoneReward = getStreakMilestoneReward(streakData.current_streak)

    return NextResponse.json({
      user_id,
      current_streak: streakData.current_streak,
      longest_streak: streakData.longest_streak,
      last_activity_date: streakData.last_activity_date,
      qualifies_for_daily: qualifiesForDaily,
      today_summary: dailySummary,
      status: statusInfo,
      streak_freeze: {
        can_use: freezeInfo.can_use,
        freezes_remaining: freezeInfo.freezes_remaining,
        days_since_last_freeze: freezeInfo.days_since_last_freeze,
        reason: freezeInfo.reason
      },
      next_milestone: nextMilestone,
      current_milestone: milestoneReward.is_milestone ? {
        name: milestoneReward.milestone_name,
        reward_type: milestoneReward.reward_type,
        reward_amount: milestoneReward.reward_amount
      } : null
    })

  } catch (error) {
    console.error('Error in streaks GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Update user streak based on daily activity
export async function POST(request: NextRequest) {
  try {
    const body: UpdateStreakRequest = await request.json()
    const { user_id, activity_date, force_update } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const targetDate = activity_date ? new Date(activity_date) : new Date()
    const targetDateStr = targetDate.toISOString().split('T')[0]

    // Get current user streak data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        current_streak,
        longest_streak,
        last_activity_date,
        streak_freeze_count,
        last_streak_freeze_date,
        subscription_tier
      `)
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const currentStreakData: StreakData = {
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_activity_date: profile?.last_activity_date,
      streak_freeze_count: profile?.streak_freeze_count || 0,
      last_streak_freeze_date: profile?.last_streak_freeze_date
    }

    // Get activities for the target date
    const { data: dayActivities, error: activitiesError } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', `${targetDateStr}T00:00:00.000Z`)
      .lt('created_at', `${targetDateStr}T23:59:59.999Z`)

    if (activitiesError) {
      console.error('Error fetching day activities:', activitiesError)
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      )
    }

    // Calculate daily activity summary
    const dailySummary = calculateDailyActivitySummary(dayActivities || [], targetDate)
    
    // Check if user qualifies for daily activity
    const qualifiesForDaily = qualifiesForDailyActivity(
      dailySummary.questions_answered,
      dailySummary.lessons_completed,
      dailySummary.xp_earned,
      0 // We don't track time spent yet
    )

    if (!qualifiesForDaily && !force_update) {
      return NextResponse.json({
        success: false,
        message: 'User does not qualify for daily activity',
        requirements: {
          min_questions: 5,
          min_xp: 20,
          min_lessons: 1
        },
        current_activity: dailySummary
      })
    }

    // Calculate new streak
    const lastActivityDate = qualifiesForDaily ? targetDate : null
    const streakResult = calculateStreak(currentStreakData, lastActivityDate, targetDate)

    // Update user profile with new streak data
    const updateData: any = {
      current_streak: streakResult.current_streak,
      longest_streak: streakResult.longest_streak
    }

    if (qualifiesForDaily) {
      updateData.last_activity_date = targetDateStr
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user streak:', updateError)
      return NextResponse.json(
        { error: 'Failed to update streak' },
        { status: 500 }
      )
    }

    // Check for milestone rewards
    let milestoneReward = null
    if (streakResult.streak_extended) {
      const milestone = getStreakMilestoneReward(streakResult.current_streak)
      if (milestone.is_milestone) {
        milestoneReward = milestone

        // Award milestone reward
        if (milestone.reward_type === 'xp' && milestone.reward_amount) {
          await supabase
            .from('xp_activities')
            .insert({
              user_id,
              xp_amount: milestone.reward_amount,
              activity_type: 'streak_bonus',
              activity_details: {
                milestone_name: milestone.milestone_name,
                streak_days: streakResult.current_streak
              },
              created_at: new Date().toISOString()
            })

          // Update user's total XP
          await supabase.rpc('increment_user_xp', {
            user_id_param: user_id,
            xp_amount: milestone.reward_amount
          })
        }

        // Record achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id,
            achievement_type: 'streak_milestone',
            achievement_data: {
              milestone_name: milestone.milestone_name,
              streak_days: streakResult.current_streak,
              reward_type: milestone.reward_type,
              reward_amount: milestone.reward_amount
            },
            created_at: new Date().toISOString()
          })
      }
    }

    // Get updated status
    const statusInfo = getStreakStatusDescription(
      streakResult.current_streak,
      qualifiesForDaily ? targetDateStr : currentStreakData.last_activity_date
    )

    return NextResponse.json({
      success: true,
      streak_updated: true,
      old_streak: currentStreakData.current_streak,
      new_streak: streakResult.current_streak,
      longest_streak: streakResult.longest_streak,
      streak_extended: streakResult.streak_extended,
      streak_broken: streakResult.streak_broken,
      streak_maintained: streakResult.streak_maintained,
      qualified_for_daily: qualifiesForDaily,
      daily_summary: dailySummary,
      milestone_reward: milestoneReward,
      status: statusInfo
    })

  } catch (error) {
    console.error('Error in streaks POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Use streak freeze
export async function PUT(request: NextRequest) {
  try {
    const body: UseStreakFreezeRequest = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Get current user data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        current_streak,
        longest_streak,
        last_activity_date,
        streak_freeze_count,
        last_streak_freeze_date,
        subscription_tier
      `)
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const streakData: StreakData = {
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_activity_date: profile?.last_activity_date,
      streak_freeze_count: profile?.streak_freeze_count || 0,
      last_streak_freeze_date: profile?.last_streak_freeze_date
    }

    // Check if user can use streak freeze
    const freezeInfo = canUseStreakFreeze(
      streakData,
      profile?.subscription_tier || 'free'
    )

    if (!freezeInfo.can_use) {
      return NextResponse.json({
        success: false,
        error: freezeInfo.reason,
        freezes_remaining: freezeInfo.freezes_remaining
      })
    }

    // Apply streak freeze
    const today = new Date().toISOString().split('T')[0]
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_freeze_count: streakData.streak_freeze_count + 1,
        last_streak_freeze_date: today,
        last_activity_date: today // Extend last activity to today
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error applying streak freeze:', updateError)
      return NextResponse.json(
        { error: 'Failed to apply streak freeze' },
        { status: 500 }
      )
    }

    // Record the streak freeze activity
    await supabase
      .from('user_achievements')
      .insert({
        user_id,
        achievement_type: 'streak_freeze_used',
        achievement_data: {
          streak_preserved: streakData.current_streak,
          freezes_remaining: freezeInfo.freezes_remaining - 1
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Streak freeze applied successfully',
      streak_preserved: streakData.current_streak,
      freezes_remaining: freezeInfo.freezes_remaining - 1,
      next_freeze_available_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })

  } catch (error) {
    console.error('Error in streak freeze API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

