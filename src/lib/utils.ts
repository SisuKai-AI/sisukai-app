import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

export function getMasteryColor(masteryLevel: number): string {
  if (masteryLevel >= 0.8) return 'text-green-600'
  if (masteryLevel >= 0.6) return 'text-yellow-600'
  if (masteryLevel >= 0.4) return 'text-orange-600'
  return 'text-red-600'
}

export function getMasteryLabel(masteryLevel: number): string {
  if (masteryLevel >= 0.8) return 'Mastered'
  if (masteryLevel >= 0.6) return 'Proficient'
  if (masteryLevel >= 0.4) return 'Learning'
  return 'Beginner'
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600 bg-green-100'
    case 'intermediate':
      return 'text-yellow-600 bg-yellow-100'
    case 'advanced':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥'
  if (streak >= 14) return '⚡'
  if (streak >= 7) return '💪'
  if (streak >= 3) return '🎯'
  return '⭐'
}

export function getXPForLevel(level: number): number {
  // Simple XP calculation: level^2 * 100
  return level * level * 100
}

export function getLevelFromXP(xp: number): number {
  // Reverse calculation: sqrt(xp / 100)
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function getXPProgress(xp: number): { currentLevel: number; nextLevel: number; progress: number } {
  const currentLevel = getLevelFromXP(xp)
  const currentLevelXP = getXPForLevel(currentLevel - 1)
  const nextLevelXP = getXPForLevel(currentLevel)
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    progress: Math.min(progress, 100)
  }
}


export function formatTimerTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

