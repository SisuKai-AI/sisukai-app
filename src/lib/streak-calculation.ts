// Streak calculation utilities for daily gamification system

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_freeze_count: number
  last_streak_freeze_date: string | null
}

export interface DailyActivity {
  user_id: string
  activity_date: string
  activities_completed: number
  xp_earned: number
  lessons_completed: number
  questions_answered: number
}

/**
 * Calculate streak based on daily activity
 * Similar to Duolingo's streak system
 */
export function calculateStreak(
  currentStreakData: StreakData,
  lastActivityDate: Date | null,
  today: Date = new Date()
): {
  current_streak: number
  longest_streak: number
  streak_maintained: boolean
  streak_broken: boolean
  streak_extended: boolean
} {
  const todayStr = today.toISOString().split('T')[0]
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  let current_streak = currentStreakData.current_streak
  let longest_streak = currentStreakData.longest_streak
  let streak_maintained = false
  let streak_broken = false
  let streak_extended = false

  if (!lastActivityDate) {
    // No activity today, check if streak should be broken
    const lastActivityStr = currentStreakData.last_activity_date
    
    if (lastActivityStr) {
      const lastActivity = new Date(lastActivityStr)
      const lastActivityDateStr = lastActivity.toISOString().split('T')[0]
      
      // If last activity was not yesterday and not today, break streak
      if (lastActivityDateStr !== yesterdayStr && lastActivityDateStr !== todayStr) {
        if (current_streak > 0) {
          streak_broken = true
          current_streak = 0
        }
      }
    }
  } else {
    // User has activity today
    const lastActivityStr = lastActivityDate.toISOString().split('T')[0]
    const previousActivityStr = currentStreakData.last_activity_date
    
    if (lastActivityStr === todayStr) {
      // Activity today
      if (previousActivityStr) {
        const previousActivity = new Date(previousActivityStr)
        const previousActivityDateStr = previousActivity.toISOString().split('T')[0]
        
        if (previousActivityDateStr === yesterdayStr) {
          // Consecutive day - extend streak
          current_streak += 1
          streak_extended = true
        } else if (previousActivityDateStr === todayStr) {
          // Already counted today - maintain streak
          streak_maintained = true
        } else {
          // Gap in activity - reset streak to 1
          if (current_streak > 0) {
            streak_broken = true
          }
          current_streak = 1
          streak_extended = true
        }
      } else {
        // First activity ever
        current_streak = 1
        streak_extended = true
      }
    }
  }

  // Update longest streak if current is higher
  if (current_streak > longest_streak) {
    longest_streak = current_streak
  }

  return {
    current_streak,
    longest_streak,
    streak_maintained,
    streak_broken,
    streak_extended
  }
}

/**
 * Check if user qualifies for daily activity (minimum requirements)
 */
export function qualifiesForDailyActivity(
  questionsAnswered: number,
  lessonsCompleted: number,
  xpEarned: number,
  timeSpentMinutes: number
): boolean {
  // Minimum requirements for maintaining streak (similar to Duolingo)
  const MIN_QUESTIONS = 5
  const MIN_XP = 20
  const MIN_TIME_MINUTES = 5

  return (
    questionsAnswered >= MIN_QUESTIONS ||
    xpEarned >= MIN_XP ||
    timeSpentMinutes >= MIN_TIME_MINUTES ||
    lessonsCompleted >= 1
  )
}

/**
 * Calculate streak freeze eligibility
 * Users can freeze their streak to prevent it from breaking
 */
export function canUseStreakFreeze(
  currentStreakData: StreakData,
  userTier: 'free' | 'pro' = 'free'
): {
  can_use: boolean
  freezes_remaining: number
  days_since_last_freeze: number
  reason?: string
} {
  const MAX_FREEZES_FREE = 2
  const MAX_FREEZES_PRO = 5
  const MIN_DAYS_BETWEEN_FREEZES = 7
  const MIN_STREAK_FOR_FREEZE = 7

  const maxFreezes = userTier === 'pro' ? MAX_FREEZES_PRO : MAX_FREEZES_FREE
  const freezesUsed = currentStreakData.streak_freeze_count || 0
  const freezesRemaining = Math.max(0, maxFreezes - freezesUsed)

  // Check minimum streak requirement
  if (currentStreakData.current_streak < MIN_STREAK_FOR_FREEZE) {
    return {
      can_use: false,
      freezes_remaining,
      days_since_last_freeze: 0,
      reason: `Need at least ${MIN_STREAK_FOR_FREEZE} day streak to use freeze`
    }
  }

  // Check if user has freezes remaining
  if (freezesRemaining <= 0) {
    return {
      can_use: false,
      freezes_remaining: 0,
      days_since_last_freeze: 0,
      reason: 'No streak freezes remaining'
    }
  }

  // Check time since last freeze
  let daysSinceLastFreeze = Infinity
  if (currentStreakData.last_streak_freeze_date) {
    const lastFreeze = new Date(currentStreakData.last_streak_freeze_date)
    const today = new Date()
    daysSinceLastFreeze = Math.floor((today.getTime() - lastFreeze.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceLastFreeze < MIN_DAYS_BETWEEN_FREEZES) {
      return {
        can_use: false,
        freezes_remaining,
        days_since_last_freeze: daysSinceLastFreeze,
        reason: `Must wait ${MIN_DAYS_BETWEEN_FREEZES - daysSinceLastFreeze} more days`
      }
    }
  }

  return {
    can_use: true,
    freezes_remaining,
    days_since_last_freeze: daysSinceLastFreeze === Infinity ? 0 : daysSinceLastFreeze
  }
}

/**
 * Calculate streak milestone rewards
 */
export function getStreakMilestoneReward(streak: number): {
  is_milestone: boolean
  reward_type?: 'xp' | 'badge' | 'freeze'
  reward_amount?: number
  milestone_name?: string
} {
  const milestones = [
    { streak: 7, type: 'xp', amount: 100, name: 'Week Warrior' },
    { streak: 14, type: 'freeze', amount: 1, name: 'Two Week Champion' },
    { streak: 30, type: 'xp', amount: 500, name: 'Monthly Master' },
    { streak: 50, type: 'badge', amount: 1, name: 'Dedication Expert' },
    { streak: 100, type: 'xp', amount: 1000, name: 'Century Achiever' },
    { streak: 365, type: 'badge', amount: 1, name: 'Year Long Learner' }
  ]

  const milestone = milestones.find(m => m.streak === streak)
  
  if (milestone) {
    return {
      is_milestone: true,
      reward_type: milestone.type as 'xp' | 'badge' | 'freeze',
      reward_amount: milestone.amount,
      milestone_name: milestone.name
    }
  }

  return { is_milestone: false }
}

/**
 * Get streak status description for UI
 */
export function getStreakStatusDescription(
  currentStreak: number,
  lastActivityDate: string | null
): {
  status: 'active' | 'at_risk' | 'broken' | 'new'
  message: string
  color: 'green' | 'yellow' | 'red' | 'blue'
  action?: string
} {
  if (currentStreak === 0) {
    return {
      status: 'new',
      message: 'Start your learning streak today!',
      color: 'blue',
      action: 'Complete a lesson to begin'
    }
  }

  if (!lastActivityDate) {
    return {
      status: 'at_risk',
      message: `Your ${currentStreak} day streak is at risk!`,
      color: 'yellow',
      action: 'Complete a lesson today to maintain it'
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const lastActivity = new Date(lastActivityDate).toISOString().split('T')[0]

  if (lastActivity === today) {
    return {
      status: 'active',
      message: `Great! You've maintained your ${currentStreak} day streak`,
      color: 'green'
    }
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  if (lastActivity === yesterday) {
    return {
      status: 'at_risk',
      message: `Your ${currentStreak} day streak is at risk!`,
      color: 'yellow',
      action: 'Complete a lesson today to maintain it'
    }
  }

  return {
    status: 'broken',
    message: 'Your streak was broken. Start a new one!',
    color: 'red',
    action: 'Complete a lesson to begin a new streak'
  }
}

/**
 * Calculate daily activity summary for a user
 */
export function calculateDailyActivitySummary(
  activities: Array<{
    activity_type: string
    xp_amount: number
    created_at: string
    activity_details?: any
  }>,
  targetDate: Date = new Date()
): DailyActivity {
  const targetDateStr = targetDate.toISOString().split('T')[0]
  
  // Filter activities for the target date
  const dayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at).toISOString().split('T')[0]
    return activityDate === targetDateStr
  })

  const summary: DailyActivity = {
    user_id: '', // Will be set by caller
    activity_date: targetDateStr,
    activities_completed: dayActivities.length,
    xp_earned: dayActivities.reduce((sum, activity) => sum + activity.xp_amount, 0),
    lessons_completed: dayActivities.filter(a => a.activity_type === 'lesson_complete').length,
    questions_answered: dayActivities.filter(a => a.activity_type === 'question_correct').length
  }

  return summary
}

/**
 * Get next streak milestone
 */
export function getNextStreakMilestone(currentStreak: number): {
  next_milestone: number
  days_to_milestone: number
  milestone_name: string
  reward_preview: string
} {
  const milestones = [
    { streak: 7, name: 'Week Warrior', reward: '100 XP bonus' },
    { streak: 14, name: 'Two Week Champion', reward: 'Free streak freeze' },
    { streak: 30, name: 'Monthly Master', reward: '500 XP bonus' },
    { streak: 50, name: 'Dedication Expert', reward: 'Special badge' },
    { streak: 100, name: 'Century Achiever', reward: '1000 XP bonus' },
    { streak: 365, name: 'Year Long Learner', reward: 'Legendary badge' }
  ]

  const nextMilestone = milestones.find(m => m.streak > currentStreak)
  
  if (nextMilestone) {
    return {
      next_milestone: nextMilestone.streak,
      days_to_milestone: nextMilestone.streak - currentStreak,
      milestone_name: nextMilestone.name,
      reward_preview: nextMilestone.reward
    }
  }

  // If past all milestones, show next century mark
  const nextCentury = Math.ceil((currentStreak + 1) / 100) * 100
  return {
    next_milestone: nextCentury,
    days_to_milestone: nextCentury - currentStreak,
    milestone_name: `${nextCentury} Day Legend`,
    reward_preview: `${nextCentury * 10} XP bonus`
  }
}

