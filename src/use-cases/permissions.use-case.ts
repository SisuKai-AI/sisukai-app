// Permissions Use Case - Clean Architecture Use Case Layer
// This file contains business logic for determining user permissions based on roles and tiers

import * as repo from '@/lib/mock-data.repository'
import type { Permissions, User } from '@/core/domain/types'

/**
 * Get user permissions based on their role and tier
 * This is the seam for the "Advanced Tier" and other future features
 */
export const getUserPermissions = async (userId: string): Promise<Permissions> => {
  console.log(`[Use Case] Calculating permissions for user: ${userId}`)
  
  const user = await repo.getUserById(userId)
  
  if (!user) {
    // Return minimal permissions for non-existent users
    return getDefaultPermissions()
  }
  
  // Base permissions for all users
  const permissions: Permissions = getDefaultPermissions()
  
  // Role-based permissions
  if (user.role === 'admin') {
    // Admins get all permissions
    Object.keys(permissions).forEach(key => {
      ;(permissions as any)[key] = true
    })
  } else if (user.role === 'learner') {
    // Learners get learning-specific permissions based on tier
    applyLearnerPermissions(permissions, user.tier)
  }
  
  console.log(`[Use Case] Permissions calculated:`, permissions)
  return permissions
}

/**
 * Get default (minimal) permissions
 */
function getDefaultPermissions(): Permissions {
  return {
    // Learning Features
    canUseAdaptivePath: false,
    canUseAIRecommender: false,
    canAccessAdvancedAnalytics: false,
    canUseSpacedRepetition: false,
    
    // Exam Features
    canTakeFullSimulations: false,
    canAccessDetailedResults: false,
    canUseExamScheduler: false,
    
    // Social Features
    canAccessLeaderboards: false,
    canJoinStudyGroups: false,
    canShareProgress: false,
    
    // Content Features
    canAccessPremiumContent: false,
    canDownloadMaterials: false,
    canUseOfflineMode: false,
    
    // Administrative Features
    canManageUsers: false,
    canManageContent: false,
    canViewAnalytics: false,
    canManageCertifications: false,
    canAccessAdminPanel: false
  }
}

/**
 * Apply tier-based permissions for learners
 */
function applyLearnerPermissions(permissions: Permissions, tier: User['tier']): void {
  // Free tier permissions
  if (tier === 'free') {
    permissions.canTakeFullSimulations = false // Limited exam access
    permissions.canAccessDetailedResults = false
    permissions.canUseSpacedRepetition = false
  }
  
  // Pro tier permissions
  if (tier === 'pro') {
    permissions.canUseAdaptivePath = true
    permissions.canTakeFullSimulations = true
    permissions.canAccessDetailedResults = true
    permissions.canUseSpacedRepetition = true
    permissions.canAccessPremiumContent = true
    permissions.canDownloadMaterials = true
    permissions.canShareProgress = true
  }
  
  // Advanced tier permissions (ARCHITECTURAL SEAM - not implemented in MVP)
  if (tier === 'advanced') {
    // All pro permissions plus advanced features
    applyLearnerPermissions(permissions, 'pro')
    
    // Advanced-only features
    permissions.canUseAIRecommender = true
    permissions.canAccessAdvancedAnalytics = true
    permissions.canUseExamScheduler = true
    permissions.canAccessLeaderboards = true
    permissions.canJoinStudyGroups = true
    permissions.canUseOfflineMode = true
  }
}

/**
 * Check if user can access a specific feature
 */
export const canUserAccessFeature = async (userId: string, feature: keyof Permissions): Promise<boolean> => {
  console.log(`[Use Case] Checking if user ${userId} can access feature: ${feature}`)
  
  const permissions = await getUserPermissions(userId)
  return permissions[feature]
}

/**
 * Get user's tier limitations for UI display
 */
export const getUserTierLimitations = async (userId: string): Promise<{
  hasLimitations: boolean
  limitations: string[]
  upgradeMessage?: string
}> => {
  console.log(`[Use Case] Getting tier limitations for user: ${userId}`)
  
  const user = await repo.getUserById(userId)
  
  if (!user || user.tier === 'advanced') {
    return {
      hasLimitations: false,
      limitations: []
    }
  }
  
  if (user.tier === 'free') {
    return {
      hasLimitations: true,
      limitations: [
        'Limited to 3 topics',
        'Basic exam practice only',
        'No adaptive learning paths',
        'No detailed progress analytics',
        'No downloadable materials'
      ],
      upgradeMessage: 'Upgrade to Pro to unlock all features and adaptive learning!'
    }
  }
  
  if (user.tier === 'pro') {
    return {
      hasLimitations: true,
      limitations: [
        'No AI-powered recommendations',
        'No advanced analytics dashboard',
        'No offline mode',
        'No study groups access'
      ],
      upgradeMessage: 'Upgrade to Advanced for AI recommendations and social features!'
    }
  }
  
  return {
    hasLimitations: false,
    limitations: []
  }
}

/**
 * Validate user access to admin features
 */
export const validateAdminAccess = async (userId: string): Promise<{
  hasAccess: boolean
  reason?: string
}> => {
  console.log(`[Use Case] Validating admin access for user: ${userId}`)
  
  const user = await repo.getUserById(userId)
  
  if (!user) {
    return {
      hasAccess: false,
      reason: 'User not found'
    }
  }
  
  if (user.role !== 'admin') {
    return {
      hasAccess: false,
      reason: 'Insufficient privileges - admin role required'
    }
  }
  
  return {
    hasAccess: true
  }
}

/**
 * Get feature availability matrix for UI components
 */
export const getFeatureAvailability = async (userId: string): Promise<{
  tier: User['tier']
  role: User['role']
  features: Record<string, boolean>
}> => {
  console.log(`[Use Case] Getting feature availability matrix for user: ${userId}`)
  
  const user = await repo.getUserById(userId)
  const permissions = await getUserPermissions(userId)
  
  if (!user) {
    return {
      tier: 'free',
      role: 'learner',
      features: {}
    }
  }
  
  return {
    tier: user.tier,
    role: user.role,
    features: {
      adaptiveLearning: permissions.canUseAdaptivePath,
      fullExams: permissions.canTakeFullSimulations,
      detailedAnalytics: permissions.canAccessAdvancedAnalytics,
      aiRecommendations: permissions.canUseAIRecommender,
      socialFeatures: permissions.canJoinStudyGroups,
      adminPanel: permissions.canAccessAdminPanel,
      contentManagement: permissions.canManageContent,
      userManagement: permissions.canManageUsers
    }
  }
}

