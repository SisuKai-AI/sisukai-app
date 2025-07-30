'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Award, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Users,
  BookOpen,
  Target,
  Clock,
  DollarSign,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

export default function AdminCertificationsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCert, setSelectedCert] = useState(null)

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  const certifications = [
    {
      id: 'cert-pmp-1',
      name: 'Project Management Professional (PMP)',
      category: 'Project Management',
      difficulty: 'Advanced',
      status: 'Published',
      enrolled: 5420,
      completed: 1234,
      price: 299,
      domains: 5,
      questions: 1200,
      lastUpdated: '2024-01-15',
      completionRate: 23,
      avgScore: 76.5
    },
    {
      id: 'cert-cissp-1',
      name: 'Certified Information Systems Security Professional',
      category: 'Cybersecurity',
      difficulty: 'Expert',
      status: 'Published',
      enrolled: 3210,
      completed: 892,
      price: 399,
      domains: 8,
      questions: 1500,
      lastUpdated: '2024-01-20',
      completionRate: 28,
      avgScore: 78.2
    },
    {
      id: 'cert-aws-1',
      name: 'AWS Solutions Architect Associate',
      category: 'Cloud Computing',
      difficulty: 'Intermediate',
      status: 'Draft',
      enrolled: 0,
      completed: 0,
      price: 199,
      domains: 4,
      questions: 800,
      lastUpdated: '2024-01-25',
      completionRate: 0,
      avgScore: 0
    },
    {
      id: 'cert-scrum-1',
      name: 'Certified Scrum Master',
      category: 'Agile',
      difficulty: 'Beginner',
      status: 'Published',
      enrolled: 2890,
      completed: 1089,
      price: 149,
      domains: 3,
      questions: 600,
      lastUpdated: '2024-01-10',
      completionRate: 38,
      avgScore: 82.1
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-yellow-100 text-yellow-800'
      case 'Archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-blue-100 text-blue-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-orange-100 text-orange-800'
      case 'Expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certification Management</h1>
              <p className="text-gray-600 mt-1">
                Manage certification programs, content, and learner enrollment
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Certification
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-gray-500">Total Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">11,520</p>
                  <p className="text-xs text-gray-500">Total Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">3,215</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">$47,892</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search certifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Programs</CardTitle>
            <CardDescription>Manage certification content, pricing, and learner access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Certification</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Enrolled</th>
                    <th className="text-left p-3">Completion</th>
                    <th className="text-left p-3">Avg Score</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Last Updated</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <div className="flex space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{cert.category}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(cert.difficulty)}`}>
                              {cert.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {cert.domains} domains • {cert.questions} questions
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(cert.status)}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{cert.enrolled.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{cert.completed.toLocaleString()} completed</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Progress value={cert.completionRate} className="w-16 h-2" />
                            <span className="text-xs font-medium">{cert.completionRate}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{cert.avgScore > 0 ? `${cert.avgScore}%` : '-'}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">${cert.price}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {cert.lastUpdated}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" title="View Details">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" title="Edit">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" title="Settings">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" title="More Options">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Generate Study Materials
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Create Question Bank
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                Setup Exam Parameters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learner Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Enrolled Learners
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Issue Certificates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Track Progress
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Performance Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

