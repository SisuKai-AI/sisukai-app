// Mastery calculation utilities based on unit-tested algorithms

export interface MasteryData {
  masteryLevel: number
  totalAttempts: number
  correctAttempts: number
  consecutiveCorrect: number
  lastPracticed: Date
}

export interface QuestionAttempt {
  isCorrect: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  timeSpent?: number
  timestamp: Date
}

/**
 * Calculate new mastery level based on question attempt
 * This implements the algorithm that passed unit tests
 */
export function calculateNewMasteryLevel(
  currentMastery: number,
  isCorrect: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  consecutiveCorrect: number = 0
): number {
  // Ensure mastery is within bounds
  currentMastery = Math.max(0, Math.min(1, currentMastery))

  const difficultyMultiplier = {
    'easy': 1.0,
    'medium': 1.2,
    'hard': 1.5
  }[difficulty]

  if (isCorrect) {
    // Base increase for correct answers
    const baseIncrease = 0.1 * difficultyMultiplier
    
    // Streak bonus (up to 10% additional)
    const streakBonus = Math.min(consecutiveCorrect * 0.02, 0.1)
    
    // Diminishing returns for high mastery
    const diminishingFactor = currentMastery > 0.8 ? 0.5 : 1.0
    
    const totalIncrease = (baseIncrease + streakBonus) * diminishingFactor
    
    return Math.min(currentMastery + totalIncrease, 1.0)
  } else {
    // Decrease for incorrect answers
    const decrease = 0.05 * difficultyMultiplier
    
    // Less penalty for high mastery (knowledge retention)
    const retentionFactor = currentMastery > 0.7 ? 0.7 : 1.0
    
    const totalDecrease = decrease * retentionFactor
    
    return Math.max(currentMastery - totalDecrease, 0.0)
  }
}

/**
 * Calculate XP earned based on performance and mastery
 */
export function calculateXPEarned(
  isCorrect: boolean,
  difficulty: 'easy' | 'medium' | 'hard',
  currentMastery: number,
  timeSpent?: number
): number {
  if (!isCorrect) return 0

  // Base XP by difficulty
  const baseXP = {
    'easy': 10,
    'medium': 15,
    'hard': 25
  }[difficulty]

  // Mastery bonus (higher mastery = more XP for maintaining skill)
  const masteryBonus = currentMastery > 0.8 ? Math.floor(baseXP * 0.5) : 0

  // Speed bonus (if answered quickly)
  let speedBonus = 0
  if (timeSpent && timeSpent < 30) { // Less than 30 seconds
    speedBonus = Math.floor(baseXP * 0.2)
  }

  return baseXP + masteryBonus + speedBonus
}

/**
 * Determine if user needs spaced repetition for a topic
 */
export function needsSpacedRepetition(
  masteryLevel: number,
  lastPracticed: Date,
  totalAttempts: number
): boolean {
  const daysSinceLastPractice = (Date.now() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
  
  // Low mastery needs frequent practice
  if (masteryLevel < 0.3) {
    return daysSinceLastPractice > 1
  }
  
  // Medium mastery needs moderate practice
  if (masteryLevel < 0.7) {
    return daysSinceLastPractice > 3
  }
  
  // High mastery needs less frequent practice
  if (masteryLevel < 0.9) {
    return daysSinceLastPractice > 7
  }
  
  // Very high mastery needs minimal practice
  return daysSinceLastPractice > 14
}

/**
 * Calculate adaptive learning path priority
 */
export function calculateTopicPriority(
  masteryLevel: number,
  lastPracticed: Date,
  totalAttempts: number,
  certificationWeight: number = 1.0
): number {
  const daysSinceLastPractice = (Date.now() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
  
  // Lower mastery = higher priority
  const masteryFactor = 1.0 - masteryLevel
  
  // More time since practice = higher priority
  const timeFactor = Math.min(daysSinceLastPractice / 7, 2.0) // Cap at 2x
  
  // Less attempts = higher priority (new topics)
  const attemptFactor = totalAttempts === 0 ? 1.5 : Math.max(0.5, 1.0 - (totalAttempts / 20))
  
  // Certification weight (some topics more important)
  const weightFactor = certificationWeight
  
  return masteryFactor * timeFactor * attemptFactor * weightFactor
}

/**
 * Update user mastery data after question attempt
 */
export function updateMasteryData(
  currentData: MasteryData,
  attempt: QuestionAttempt
): MasteryData {
  const newTotalAttempts = currentData.totalAttempts + 1
  const newCorrectAttempts = currentData.correctAttempts + (attempt.isCorrect ? 1 : 0)
  
  // Calculate consecutive correct (simplified - in real implementation would track sequence)
  const newConsecutiveCorrect = attempt.isCorrect ? currentData.consecutiveCorrect + 1 : 0
  
  const newMasteryLevel = calculateNewMasteryLevel(
    currentData.masteryLevel,
    attempt.isCorrect,
    attempt.difficulty,
    newConsecutiveCorrect
  )
  
  return {
    masteryLevel: newMasteryLevel,
    totalAttempts: newTotalAttempts,
    correctAttempts: newCorrectAttempts,
    consecutiveCorrect: newConsecutiveCorrect,
    lastPracticed: attempt.timestamp
  }
}

/**
 * Get mastery level description for UI
 */
export function getMasteryDescription(masteryLevel: number): {
  level: string
  description: string
  color: string
} {
  if (masteryLevel < 0.2) {
    return {
      level: 'Beginner',
      description: 'Just getting started with this topic',
      color: 'red'
    }
  } else if (masteryLevel < 0.4) {
    return {
      level: 'Learning',
      description: 'Building understanding of key concepts',
      color: 'orange'
    }
  } else if (masteryLevel < 0.6) {
    return {
      level: 'Developing',
      description: 'Good grasp of fundamentals',
      color: 'yellow'
    }
  } else if (masteryLevel < 0.8) {
    return {
      level: 'Proficient',
      description: 'Strong understanding and application',
      color: 'blue'
    }
  } else if (masteryLevel < 0.95) {
    return {
      level: 'Advanced',
      description: 'Excellent mastery of the topic',
      color: 'green'
    }
  } else {
    return {
      level: 'Expert',
      description: 'Complete mastery achieved',
      color: 'purple'
    }
  }
}

