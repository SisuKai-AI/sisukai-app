'use client'

import { useState, useEffect } from 'react'
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
  XCircle,
  Sparkles,
  Loader2
} from 'lucide-react'

interface Certification {
  id: string
  name: string
  description: string
  status: string
  created_at: string
  updated_at: string
  estimated_hours?: number
  ai_generated_structure?: any
}

export default function AdminCertificationsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCertification, setNewCertification] = useState({
    name: '',
    description: '',
    useAI: false
  })

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  // Load certifications
  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      const response = await fetch('/api/admin/certifications')
      if (response.ok) {
        const data = await response.json()
        setCertifications(data.certifications || [])
      } else {
        console.error('Failed to load certifications')
      }
    } catch (error) {
      console.error('Error loading certifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCertification = async () => {
    if (!newCertification.name || !newCertification.description) {
      alert('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCertification)
      })

      if (response.ok) {
        const data = await response.json()
        setCertifications([data.certification, ...certifications])
        setNewCertification({ name: '', description: '', useAI: false })
        setShowCreateForm(false)
        alert(data.message || 'Certification created successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating certification:', error)
      alert('Failed to create certification')
    } finally {
      setCreating(false)
    }
  }

  const deleteCertification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/certifications/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCertifications(certifications.filter(cert => cert.id !== id))
        alert('Certification deleted successfully')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting certification:', error)
      alert('Failed to delete certification')
    }
  }

  const filteredCertifications = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: certifications.length,
    published: certifications.filter(c => c.status === 'published').length,
    draft: certifications.filter(c => c.status === 'draft').length,
    aiGenerated: certifications.filter(c => c.ai_generated_structure).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading certifications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
              <p className="text-gray-600 mt-1">
                Manage certification programs and their content structure
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Certification
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total Certifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.published}</p>
                  <p className="text-xs text-gray-500">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.draft}</p>
                  <p className="text-xs text-gray-500">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.aiGenerated}</p>
                  <p className="text-xs text-gray-500">AI Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Certification Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Certification</CardTitle>
              <CardDescription>
                Add a new certification program with optional AI-generated structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Certification Name</label>
                <Input
                  placeholder="e.g., Project Management Professional (PMP)"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({
                    ...newCertification,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe the certification program, its objectives, and target audience..."
                  value={newCertification.description}
                  onChange={(e) => setNewCertification({
                    ...newCertification,
                    description: e.target.value
                  })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={newCertification.useAI}
                  onChange={(e) => setNewCertification({
                    ...newCertification,
                    useAI: e.target.checked
                  })}
                />
                <label htmlFor="useAI" className="text-sm font-medium">
                  Generate structure with AI
                </label>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={createCertification}
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {newCertification.useAI ? 'Generating with AI...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Certification
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Certifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Programs</CardTitle>
            <CardDescription>
              Manage your certification programs and their content structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCertifications.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No certifications found</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4"
                >
                  Create Your First Certification
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Created</th>
                      <th className="text-left p-3">AI Generated</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertifications.map((cert) => (
                      <tr key={cert.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {cert.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            cert.status === 'published' ? 'bg-green-100 text-green-800' :
                            cert.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(cert.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {cert.ai_generated_structure ? (
                            <div className="flex items-center text-purple-600">
                              <Sparkles className="h-4 w-4 mr-1" />
                              <span className="text-xs">Yes</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">No</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteCertification(cert.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

