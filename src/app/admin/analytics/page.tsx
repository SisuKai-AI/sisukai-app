'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp,
  Users,
  BookOpen,
  Award,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  Target,
  Zap
} from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  const metrics = [
    { 
      label: 'Total Learners', 
      value: '15,420', 
      change: '+12.5%', 
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    { 
      label: 'Active Learners', 
      value: '8,934', 
      change: '+8.2%', 
      trend: 'up',
      icon: Zap,
      color: 'green'
    },
    { 
      label: 'Certifications Completed', 
      value: '2,847', 
      change: '+15.3%', 
      trend: 'up',
      icon: Award,
      color: 'yellow'
    },
    { 
      label: 'Revenue', 
      value: '$47,892', 
      change: '+23.1%', 
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    }
  ]

  const certificationStats = [
    { name: 'PMP', enrolled: 5420, completed: 1234, completion_rate: 23 },
    { name: 'CISSP', enrolled: 3210, completed: 892, completion_rate: 28 },
    { name: 'AWS Solutions Architect', enrolled: 4567, completed: 1456, completion_rate: 32 },
    { name: 'Scrum Master', enrolled: 2890, completed: 1089, completion_rate: 38 }
  ]

  const recentActivity = [
    { action: 'New learner registration', user: 'Sarah Johnson', time: '2 minutes ago', type: 'user' },
    { action: 'Certification completed', user: 'Mike Chen', certification: 'PMP', time: '15 minutes ago', type: 'completion' },
    { action: 'Pro subscription upgrade', user: 'Alex Rodriguez', time: '32 minutes ago', type: 'upgrade' },
    { action: 'Exam attempt', user: 'Emily Davis', certification: 'CISSP', time: '1 hour ago', type: 'exam' },
    { action: 'Content published', user: 'Admin', content: 'Risk Management Guide', time: '2 hours ago', type: 'content' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor platform performance and learner engagement
              </p>
            </div>
            <div className="flex space-x-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change} from last period
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 text-${metric.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Learner Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Learner Engagement
              </CardTitle>
              <CardDescription>Daily active learners over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chart visualization would appear here</p>
                  <p className="text-sm text-gray-400">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Revenue Trends
              </CardTitle>
              <CardDescription>Monthly recurring revenue and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Revenue chart would appear here</p>
                  <p className="text-sm text-gray-400">Integration with charting library required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Certification Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certification Performance
              </CardTitle>
              <CardDescription>Enrollment and completion rates by certification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificationStats.map((cert, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cert.name}</span>
                      <span className="text-sm text-gray-600">
                        {cert.completed}/{cert.enrolled} completed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={cert.completion_rate} className="flex-1" />
                      <span className="text-sm font-medium w-12">{cert.completion_rate}%</span>
                    </div>
                  </div>
                ))}
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
              <CardDescription>Latest platform activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'completion' ? 'bg-green-500' :
                      activity.type === 'upgrade' ? 'bg-yellow-500' :
                      activity.type === 'exam' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.user}
                        {activity.certification && ` - ${activity.certification}`}
                        {activity.content && ` - ${activity.content}`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Most Viewed Content</span>
                  <span className="text-sm font-medium">Risk Management Guide</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Completion Rate</span>
                  <span className="text-sm font-medium">78.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Content Views</span>
                  <span className="text-sm font-medium">45,892</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exam Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Exams Taken</span>
                  <span className="text-sm font-medium">12,456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Score</span>
                  <span className="text-sm font-medium">76.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pass Rate</span>
                  <span className="text-sm font-medium">68.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">7-Day Retention</span>
                  <span className="text-sm font-medium">85.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">30-Day Retention</span>
                  <span className="text-sm font-medium">62.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">90-Day Retention</span>
                  <span className="text-sm font-medium">41.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

