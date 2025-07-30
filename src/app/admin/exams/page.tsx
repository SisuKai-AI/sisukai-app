'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  FileText,
  Settings,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

export default function AdminExamManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const examStats = {
    totalExams: 12,
    activeExams: 8,
    completedToday: 45,
    averageScore: 78.5,
    passRate: 82.3
  }

  const recentExams = [
    { id: 1, name: 'PMP Full Simulation', attempts: 234, avgScore: 76.2, passRate: 78 },
    { id: 2, name: 'Risk Management Quiz', attempts: 156, avgScore: 82.1, passRate: 85 },
    { id: 3, name: 'Agile Methodologies', attempts: 189, avgScore: 79.3, passRate: 81 },
    { id: 4, name: 'Quality Management', attempts: 98, avgScore: 74.8, passRate: 76 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-2">Manage exams, monitor performance, and analyze results</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'exams', label: 'Exam Library', icon: FileText },
                { id: 'results', label: 'Results & Analytics', icon: CheckCircle },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Exams</p>
                      <p className="text-2xl font-bold text-gray-900">{examStats.totalExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Exams</p>
                      <p className="text-2xl font-bold text-gray-900">{examStats.activeExams}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Today</p>
                      <p className="text-2xl font-bold text-gray-900">{examStats.completedToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">{examStats.averageScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{examStats.passRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Exam Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exam Performance</CardTitle>
                <CardDescription>Performance metrics for the most popular exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{exam.name}</h3>
                        <p className="text-sm text-gray-600">{exam.attempts} attempts</p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{exam.avgScore}%</p>
                          <p className="text-xs text-gray-600">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{exam.passRate}%</p>
                          <p className="text-xs text-gray-600">Pass Rate</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exam Library Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Exam Library</h2>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Questions
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Exam
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Management</h3>
                  <p className="text-gray-600 mb-6">Create, edit, and manage exam content and settings</p>
                  <div className="flex justify-center space-x-4">
                    <Button>Create New Exam</Button>
                    <Button variant="outline">Import from Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results & Analytics Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Results & Analytics</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Analytics</h3>
                  <p className="text-gray-600 mb-6">Detailed performance analytics and reporting tools</p>
                  <div className="flex justify-center space-x-4">
                    <Button>View Reports</Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Exam Settings</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Configuration</h3>
                  <p className="text-gray-600 mb-6">Configure exam parameters, scoring, and access controls</p>
                  <div className="flex justify-center space-x-4">
                    <Button>Configure Settings</Button>
                    <Button variant="outline">Reset to Defaults</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

