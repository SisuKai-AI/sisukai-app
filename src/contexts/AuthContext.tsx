'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: (User & { role?: string }) | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      let userWithRole = session?.user ?? null
      
      // Temporary admin recognition for testing
      if (userWithRole && userWithRole.email === 'usermufran234@gmail.com') {
        userWithRole = { ...userWithRole, role: 'admin' }
      }
      
      setSession(session)
      setUser(userWithRole)
      setLoading(false)

      // Handle auth state changes
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user has a profile, if not redirect to onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          router.push('/onboarding')
        } else {
          // Redirect based on user role (or temporary admin status)
          const isAdmin = profile.role === 'admin' || session.user.email === 'usermufran234@gmail.com'
          if (isAdmin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      } else if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

