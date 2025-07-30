'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockUsers } from '@/lib/mock-data'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  tier: 'free' | 'pro' | 'admin'
  subscription_status: string
  gamification: {
    xp: number
    current_streak: number
    longest_streak: number
    level: number
    achievements: string[]
  }
  created_at: string
  last_login: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (userId: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUserId = localStorage.getItem('sisukai_user_id')
    if (storedUserId && mockUsers[storedUserId as keyof typeof mockUsers]) {
      const selectedUser = mockUsers[storedUserId as keyof typeof mockUsers]
      // Add role for admin users
      const userWithRole = {
        ...selectedUser,
        role: selectedUser.tier === 'admin' ? 'admin' : 'learner'
      }
      setUser(userWithRole)
    }
    setIsLoading(false)
  }, [])

  const login = (userId: string) => {
    const selectedUser = mockUsers[userId as keyof typeof mockUsers]
    if (selectedUser) {
      // Add role for admin users
      const userWithRole = {
        ...selectedUser,
        role: selectedUser.tier === 'admin' ? 'admin' : 'learner'
      }
      setUser(userWithRole)
      localStorage.setItem('sisukai_user_id', userId)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sisukai_user_id')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

