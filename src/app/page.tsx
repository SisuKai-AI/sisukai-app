'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockUsers } from '@/lib/mock-data'

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser)
      
      // Redirect based on user tier
      const user = mockUsers[selectedUser as keyof typeof mockUsers]
      if (user.tier === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }

  const userOptions = [
    { id: 'user-free-1', label: 'Free User (Alex Johnson)', description: 'Limited features, basic learning path' },
    { id: 'user-pro-1', label: 'Pro User (Sarah Chen)', description: 'Adaptive learning, personalized paths' },
    { id: 'admin-1', label: 'Admin User (Jordan Smith)', description: 'Full administrative access' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">SisuKai</CardTitle>
          <CardDescription className="text-lg">
            Adaptive Learning Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Demo User</h3>
            <div className="space-y-3">
              {userOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedUser === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(option.id)}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={!selectedUser}
            className="w-full"
            size="lg"
          >
            Continue as Selected User
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            This is a demo environment with mock data
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

