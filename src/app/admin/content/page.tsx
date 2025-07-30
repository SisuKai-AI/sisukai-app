'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  FileText, 
  Video,
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function ContentManagementPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  const contentStats = [
    { label: 'Total Content Items', value: '1,247', icon: BookOpen, color: 'blue' },
    { label: 'Published', value: '892', icon: CheckCircle, color: 'green' },
    { label: 'Draft', value: '234', icon: Clock, color: 'yellow' },
    { label: 'Pending Review', value: '121', icon: AlertCircle, color: 'orange' }
  ]

  const contentItems = [
    {
      id: 1,
      title: 'Risk Management Fundamentals',
      type: 'Study Guide',
      certification: 'PMP',
      status: 'Published',
      lastModified: '2024-01-30',
      author: 'AI Generated',
      views: 1234
    },
    {
      id: 2,
      title: 'Project Scope Definition',
      type: 'Video',
      certification: 'PMP',
      status: 'Draft',
      lastModified: '2024-01-29',
      author: 'Jordan Smith',
      views: 0
    },
    {
      id: 3,
      title: 'Quality Management Quiz',
      type: 'Assessment',
      certification: 'PMP',
      status: 'Pending Review',
      lastModified: '2024-01-28',
      author: 'AI Generated',
      views: 567
    }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'content', label: 'Content Library', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Edit },
    { id: 'bulk', label: 'Bulk Operations', icon: Upload }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {contentStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                        <div className="ml-4">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common content management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Create New Content</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <Upload className="h-6 w-6" />
                    <span>Bulk Upload</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <Eye className="h-6 w-6" />
                    <span>Review Queue</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New study guide published</p>
                      <p className="text-xs text-gray-500">Risk Management Fundamentals - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Content pending review</p>
                      <p className="text-xs text-gray-500">Quality Management Quiz - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Template updated</p>
                      <p className="text-xs text-gray-500">Assessment Template v2.1 - 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Table */}
            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>Manage all learning content and materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Certification</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Last Modified</th>
                        <th className="text-left p-2">Views</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-gray-500">by {item.author}</p>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {item.type}
                            </span>
                          </td>
                          <td className="p-2">{item.certification}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'Published' ? 'bg-green-100 text-green-800' :
                              item.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2 text-sm text-gray-600">{item.lastModified}</td>
                          <td className="p-2 text-sm text-gray-600">{item.views}</td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
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
          </div>
        )

      case 'templates':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Templates</CardTitle>
                <CardDescription>Manage reusable templates for content creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <Plus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="font-medium">Create New Template</p>
                      <p className="text-sm text-gray-500">Start from scratch</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <FileText className="h-8 w-8 text-blue-600 mb-4" />
                      <h3 className="font-medium mb-2">Study Guide Template</h3>
                      <p className="text-sm text-gray-600 mb-4">Standard format for study materials</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <Video className="h-8 w-8 text-green-600 mb-4" />
                      <h3 className="font-medium mb-2">Video Lesson Template</h3>
                      <p className="text-sm text-gray-600 mb-4">Template for video-based content</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'bulk':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>Import, export, and manage content in bulk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Import Content</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="font-medium mb-2">Upload Content Files</p>
                      <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select files</p>
                      <Button>Choose Files</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Export Content</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Content
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export by Certification
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Templates
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and organize learning content and materials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

