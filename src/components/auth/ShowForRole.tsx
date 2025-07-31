'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { User } from '@/core/domain/types'

interface ShowForRoleProps {
  allowedRoles: Array<User['role']>
  children: ReactNode
  fallback?: ReactNode
}

/**
 * RBAC Component - Shows content only for users with allowed roles
 * Part of Clean Architecture - UI Layer component for access control
 */
export function ShowForRole({ allowedRoles, children, fallback = null }: ShowForRoleProps) {
  const { user } = useAuth()
  
  // If no user is logged in, don't show content
  if (!user) {
    return <>{fallback}</>
  }
  
  // Check if user's role is in the allowed roles list
  const hasPermission = allowedRoles.includes(user.role)
  
  return hasPermission ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common role checks
export function ShowForAdmin({ children, fallback }: Omit<ShowForRoleProps, 'allowedRoles'>) {
  return (
    <ShowForRole allowedRoles={['admin']} fallback={fallback}>
      {children}
    </ShowForRole>
  )
}

export function ShowForLearner({ children, fallback }: Omit<ShowForRoleProps, 'allowedRoles'>) {
  return (
    <ShowForRole allowedRoles={['learner']} fallback={fallback}>
      {children}
    </ShowForRole>
  )
}

// Tier-based access control (complementary to role-based)
interface ShowForTierProps {
  allowedTiers: Array<User['tier']>
  children: ReactNode
  fallback?: ReactNode
}

export function ShowForTier({ allowedTiers, children, fallback = null }: ShowForTierProps) {
  const { user } = useAuth()
  
  if (!user) {
    return <>{fallback}</>
  }
  
  const hasPermission = allowedTiers.includes(user.tier)
  
  return hasPermission ? <>{children}</> : <>{fallback}</>
}

// Convenience components for tier checks
export function ShowForPro({ children, fallback }: Omit<ShowForTierProps, 'allowedTiers'>) {
  return (
    <ShowForTier allowedTiers={['pro', 'advanced']} fallback={fallback}>
      {children}
    </ShowForTier>
  )
}

export function ShowForFree({ children, fallback }: Omit<ShowForTierProps, 'allowedTiers'>) {
  return (
    <ShowForTier allowedTiers={['free']} fallback={fallback}>
      {children}
    </ShowForTier>
  )
}

