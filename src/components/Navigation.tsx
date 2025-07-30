'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  BarChart3, 
  Trophy, 
  Settings, 
  LogOut,
  User,
  Home,
  GraduationCap,
  Users
} from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const isAdmin = user.role === 'administrator'
  
  const navItems = isAdmin ? [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/feedback', label: 'Feedback', icon: BarChart3 },
    { href: '/certifications', label: 'Certifications', icon: GraduationCap },
  ] : [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/certifications', label: 'Certifications', icon: GraduationCap },
    { href: '/exam', label: 'Exams', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SisuKai</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const href = item.href === '/exam' && user?.role === 'admin' ? '/admin/exams' : item.href
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive || (item.href === '/exam' && pathname === '/admin/exams')
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}

            <div className="flex items-center space-x-3 ml-6 pl-6 border-l">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                <div className="text-gray-500 capitalize">{user.tier} User</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

