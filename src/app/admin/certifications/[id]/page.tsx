'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCertificationById } from '@/lib/mock-data'
import { 
  ArrowLeft,
  Save,
  Settings,
  BookOpen,
  Users,
  Clock,
  Award,
  DollarSign,
  Target,
  AlertCircle
} from 'lucide-react'

export default function CertificationSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const certificationId = params.id as string
  
  const certification = getCertificationById(certificationId)
  
  const [settings, setSettings] = useState({
    name: certification?.name || '',
    description: certification?.description || '',
    category: certification?.category || '',
    difficulty: certification?.difficulty || 'intermediate',
    duration: certification?.duration || '',
    price: certification?.price || 0,
    isActive: true,
    maxAttempts: 3,
    passingScore: 70,
    timeLimit: 180, // minutes
    prerequisites: '',
    learningObjectives: '',
    targetAudience: ''
  })

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access denied. Admin privileges required.</div>
  }

  if (!certification) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Certification Not Found</h1>
            <p className="text-gray-600 mb-4">The certification with ID "{certificationId}" could not be found.</p>
            <Button onClick={() => router.push('/admin/certifications')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Certifications
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving certification settings:', settings)
    alert('Certification settings updated successfully!')
    router.push('/admin/certifications')
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certifications
          </Button>
          
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Certification Settings
              </h1>
              <p className="text-gray-600">
                Configure settings for {certification.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Certification Name</label>
                  <Input
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter certification name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter certification description"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={settings.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="project management">Project Management</option>
                      <option value="cybersecurity">Cybersecurity</option>
                      <option value="cloud computing">Cloud Computing</option>
                      <option value="agile & scrum">Agile & Scrum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                    <select
                      value={settings.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <Input
                      value={settings.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 6-8 weeks"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($)</label>
                    <Input
                      type="number"
                      value={settings.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Exam Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Attempts</label>
                    <Input
                      type="number"
                      value={settings.maxAttempts}
                      onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                    <Input
                      type="number"
                      value={settings.passingScore}
                      onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value) || 70)}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                    <Input
                      type="number"
                      value={settings.timeLimit}
                      onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 180)}
                      min="30"
                      max="480"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prerequisites</label>
                  <textarea
                    value={settings.prerequisites}
                    onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                    placeholder="Enter any prerequisites for this certification"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Learning Objectives</label>
                  <textarea
                    value={settings.learningObjectives}
                    onChange={(e) => handleInputChange('learningObjectives', e.target.value)}
                    placeholder="Enter the learning objectives for this certification"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <textarea
                    value={settings.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe the target audience for this certification"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Active Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Last updated: Today
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Enrolled: {certification.enrolledCount || 0} users
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Completed: {Math.floor((certification.enrolledCount || 0) * 0.7)} users
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Content
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Question Bank
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Enrollments
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Settings
                </Button>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Important</p>
                    <p className="text-yellow-700">
                      Changes to exam settings will affect all future attempts. Current attempts will use previous settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

