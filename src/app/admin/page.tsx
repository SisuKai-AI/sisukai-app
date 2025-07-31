'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnalytics, getFeedbackQueue } from '@/lib/mock-data.repository'
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [feedbackQueue, setFeedbackQueue] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    } else if (user && user.role === 'admin') {
      // Load data
      const loadData = async () => {
        try {
          const [analyticsData, feedbackData] = await Promise.all([
            getAnalytics(),
            getFeedbackQueue()
          ])
          setAnalytics(analyticsData)
          setFeedbackQueue(feedbackData)
        } catch (error) {
          console.error('Error loading admin data:', error)
        }
      }
      loadData()
    }
  }, [user, isLoading, router])

  if (isLoading || !analytics) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const { platformStats } = analytics
  const pendingFeedback = feedbackQueue.filter(f => f.status === 'open')
  const highPriorityFeedback = pendingFeedback.filter(f => f.priority === 'high')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your eLearning platform and monitor performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformStats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformStats.activeUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformStats.totalCertifications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Questions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {platformStats.totalQuestions.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks and management tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Manage Users</span>
                    </Button>
                  </Link>

                  <Link href="/admin/feedback">
                    <Button variant="outline" className="w-full h-20 flex-col relative">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      <span>Review Feedback</span>
                      {pendingFeedback.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {pendingFeedback.length}
                        </span>
                      )}
                    </Button>
                  </Link>

                  <Link href="/admin/content">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <BookOpen className="h-6 w-6 mb-2" />
                      <span>Content Management</span>
                    </Button>
                  </Link>

                  <Link href="/admin/analytics">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span>Analytics</span>
                    </Button>
                  </Link>

                  <Link href="/admin/settings">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Settings className="h-6 w-6 mb-2" />
                      <span>Platform Settings</span>
                    </Button>
                  </Link>

                  <Link href="/admin/certifications">
                    <Button variant="outline" className="w-full h-20 flex-col">
                      <Award className="h-6 w-6 mb-2" />
                      <span>Certification Settings</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Notifications */}
          <div className="space-y-6">
            {/* Pending Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Pending Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingFeedback.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {highPriorityFeedback.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm font-medium text-red-800">
                            {highPriorityFeedback.length} high priority item{highPriorityFeedback.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      <p>{pendingFeedback.length} total feedback items pending review</p>
                    </div>
                    
                    <Link href="/admin/feedback">
                      <Button size="sm" className="w-full">
                        Review All Feedback
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium">
                      {platformStats.averageCompletionRate}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User Engagement</span>
                    <span className="text-sm font-medium text-green-600">High</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Status</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900">New user registration</p>
                      <p className="text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900">Exam completed</p>
                      <p className="text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-gray-900">Feedback submitted</p>
                      <p className="text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

