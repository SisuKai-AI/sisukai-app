import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface AwardXPRequest {
  user_id: string
  xp_amount: number
  activity_type: 'question_correct' | 'lesson_complete' | 'streak_bonus' | 'achievement' | 'daily_goal'
  activity_details?: {
    question_id?: string
    lesson_id?: string
    difficulty?: string
    achievement_id?: string
  }
}

interface GetXPRequest {
  user_id: string
}

// XP calculation constants
const XP_REWARDS = {
  question_correct: {
    easy: 10,
    medium: 15,
    hard: 25
  },
  lesson_complete: {
    base: 50,
    bonus_multiplier: 1.2 // 20% bonus for completion
  },
  streak_bonus: {
    daily: 5,
    weekly: 25,
    monthly: 100
  },
  achievement: {
    bronze: 50,
    silver: 100,
    gold: 200,
    platinum: 500
  },
  daily_goal: 30
}

// Level calculation (similar to Duolingo)
function calculateLevel(totalXP: number): number {
  // Level progression: 100 XP for level 1, then increasing by 50 XP per level
  // Level 1: 0-99 XP, Level 2: 100-199 XP, Level 3: 200-299 XP, etc.
  if (totalXP < 100) return 1
  return Math.floor((totalXP - 100) / 100) + 2
}

function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel === 1) return 100
  return currentLevel * 100
}

function getCurrentLevelXP(totalXP: number, currentLevel: number): number {
  if (currentLevel === 1) return totalXP
  const previousLevelXP = (currentLevel - 1) * 100
  return totalXP - previousLevelXP
}

// GET: Retrieve user XP and level information
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

    // Get user's current XP from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp, current_streak, longest_streak, last_activity_date')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const totalXP = profile?.total_xp || 0
    const currentLevel = calculateLevel(totalXP)
    const xpForNextLevel = getXPForNextLevel(currentLevel)
    const currentLevelXP = getCurrentLevelXP(totalXP, currentLevel)

    // Get recent XP activities
    const { data: recentActivities, error: activitiesError } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activitiesError) {
      console.error('Error fetching XP activities:', activitiesError)
    }

    return NextResponse.json({
      user_id,
      total_xp: totalXP,
      current_level: currentLevel,
      current_level_xp: currentLevelXP,
      xp_for_next_level: xpForNextLevel,
      progress_to_next_level: (currentLevelXP / xpForNextLevel) * 100,
      current_streak: profile?.current_streak || 0,
      longest_streak: profile?.longest_streak || 0,
      last_activity_date: profile?.last_activity_date,
      recent_activities: recentActivities || []
    })

  } catch (error) {
    console.error('Error in XP GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Award XP to user
export async function POST(request: NextRequest) {
  try {
    const body: AwardXPRequest = await request.json()
    const { user_id, xp_amount, activity_type, activity_details } = body

    if (!user_id || !xp_amount || !activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate XP amount is positive
    if (xp_amount <= 0) {
      return NextResponse.json(
        { error: 'XP amount must be positive' },
        { status: 400 }
      )
    }

    // Get current user profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp, current_streak, longest_streak, last_activity_date')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const currentTotalXP = currentProfile?.total_xp || 0
    const newTotalXP = currentTotalXP + xp_amount
    const oldLevel = calculateLevel(currentTotalXP)
    const newLevel = calculateLevel(newTotalXP)
    const leveledUp = newLevel > oldLevel

    // Update user's total XP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_xp: newTotalXP,
        last_activity_date: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user XP:', updateError)
      return NextResponse.json(
        { error: 'Failed to update XP' },
        { status: 500 }
      )
    }

    // Record XP activity
    const { error: activityError } = await supabase
      .from('xp_activities')
      .insert({
        user_id,
        xp_amount,
        activity_type,
        activity_details: activity_details || {},
        created_at: new Date().toISOString()
      })

    if (activityError) {
      console.error('Error recording XP activity:', activityError)
      // Don't fail the request for this
    }

    // If user leveled up, record achievement
    if (leveledUp) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id,
          achievement_type: 'level_up',
          achievement_data: {
            old_level: oldLevel,
            new_level: newLevel
          },
          created_at: new Date().toISOString()
        })
    }

    // Calculate new level information
    const currentLevelXP = getCurrentLevelXP(newTotalXP, newLevel)
    const xpForNextLevel = getXPForNextLevel(newLevel)

    return NextResponse.json({
      success: true,
      xp_awarded: xp_amount,
      total_xp: newTotalXP,
      old_level: oldLevel,
      new_level: newLevel,
      leveled_up: leveledUp,
      current_level_xp: currentLevelXP,
      xp_for_next_level: xpForNextLevel,
      progress_to_next_level: (currentLevelXP / xpForNextLevel) * 100
    })

  } catch (error) {
    console.error('Error in XP POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Bulk XP award (for lesson completion with multiple activities)
export async function PUT(request: NextRequest) {
  try {
    const body: {
      user_id: string
      activities: Array<{
        xp_amount: number
        activity_type: string
        activity_details?: any
      }>
    } = await request.json()

    const { user_id, activities } = body

    if (!user_id || !activities || activities.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate total XP
    const totalXPToAward = activities.reduce((sum, activity) => sum + activity.xp_amount, 0)

    // Get current user profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const currentTotalXP = currentProfile?.total_xp || 0
    const newTotalXP = currentTotalXP + totalXPToAward
    const oldLevel = calculateLevel(currentTotalXP)
    const newLevel = calculateLevel(newTotalXP)
    const leveledUp = newLevel > oldLevel

    // Update user's total XP
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_xp: newTotalXP,
        last_activity_date: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user XP:', updateError)
      return NextResponse.json(
        { error: 'Failed to update XP' },
        { status: 500 }
      )
    }

    // Record all XP activities
    const activityRecords = activities.map(activity => ({
      user_id,
      xp_amount: activity.xp_amount,
      activity_type: activity.activity_type,
      activity_details: activity.activity_details || {},
      created_at: new Date().toISOString()
    }))

    const { error: activitiesError } = await supabase
      .from('xp_activities')
      .insert(activityRecords)

    if (activitiesError) {
      console.error('Error recording XP activities:', activitiesError)
      // Don't fail the request for this
    }

    // If user leveled up, record achievement
    if (leveledUp) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id,
          achievement_type: 'level_up',
          achievement_data: {
            old_level: oldLevel,
            new_level: newLevel
          },
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      success: true,
      total_xp_awarded: totalXPToAward,
      activities_count: activities.length,
      total_xp: newTotalXP,
      old_level: oldLevel,
      new_level: newLevel,
      leveled_up: leveledUp
    })

  } catch (error) {
    console.error('Error in XP PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

