'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle,
  Sparkles,
  Loader2,
  HelpCircle,
  Target
} from 'lucide-react'

interface ContentNode {
  id: string
  name: string
  description: string
  node_type: string
  certification_id: string
  parent_id: string | null
  estimated_minutes: number
  difficulty: string
  order_index: number
}

interface GenerationState {
  isGenerating: boolean
  type: 'questions' | 'concepts' | null
  nodeId: string | null
}

export default function ContentManagementPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [contentNodes, setContentNodes] = useState<ContentNode[]>([])
  const [loading, setLoading] = useState(true)
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    type: null,
    nodeId: null
  })

  if (!user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center">Access Denied</div>
  }

  useEffect(() => {
    loadContentNodes()
  }, [])

  const loadContentNodes = async () => {
    try {
      const response = await fetch('/api/admin/content-nodes')
      if (response.ok) {
        const data = await response.json()
        setContentNodes(data.contentNodes || [])
      }
    } catch (error) {
      console.error('Error loading content nodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQuestions = async (nodeId: string, nodeName: string) => {
    setGenerationState({ isGenerating: true, type: 'questions', nodeId })
    
    try {
      const response = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          node_id: nodeId,
          topic: nodeName,
          difficulty: 'intermediate',
          count: 5,
          save_to_database: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully generated ${data.questions.length} questions for ${nodeName}!`)
      } else {
        const error = await response.json()
        alert(`Error generating questions: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to generate questions')
    } finally {
      setGenerationState({ isGenerating: false, type: null, nodeId: null })
    }
  }

  const generateKeyConcepts = async (nodeId: string, nodeName: string) => {
    setGenerationState({ isGenerating: true, type: 'concepts', nodeId })
    
    try {
      const response = await fetch('/api/admin/key-concepts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          node_id: nodeId,
          topic: nodeName,
          save_to_database: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully generated ${data.concepts.length} key concepts for ${nodeName}!`)
      } else {
        const error = await response.json()
        alert(`Error generating key concepts: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating key concepts:', error)
      alert('Failed to generate key concepts')
    } finally {
      setGenerationState({ isGenerating: false, type: null, nodeId: null })
    }
  }

  const contentStats = [
    { label: 'Content Nodes', value: contentNodes.length.toString(), icon: BookOpen, color: 'blue' },
    { label: 'Domains', value: contentNodes.filter(n => n.node_type === 'domain').length.toString(), icon: Target, color: 'green' },
    { label: 'Topics', value: contentNodes.filter(n => n.node_type === 'topic').length.toString(), icon: FileText, color: 'yellow' },
    { label: 'Lessons', value: contentNodes.filter(n => n.node_type === 'lesson').length.toString(), icon: Video, color: 'purple' }
  ]

  const filteredNodes = contentNodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'content', label: 'Content Nodes', icon: FileText },
    { id: 'generation', label: 'AI Generation', icon: Sparkles },
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
                  <Button 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => setActiveTab('content')}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Create Content Node</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => setActiveTab('generation')}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>AI Generation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col space-y-2"
                    onClick={() => setActiveTab('bulk')}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Bulk Operations</span>
                  </Button>
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
                      placeholder="Search content nodes..."
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
                    New Node
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Nodes Table */}
            <Card>
              <CardHeader>
                <CardTitle>Content Nodes</CardTitle>
                <CardDescription>Manage learning content structure and hierarchy</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Loading content nodes...
                  </div>
                ) : filteredNodes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No content nodes found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-left p-3">Difficulty</th>
                          <th className="text-left p-3">Duration</th>
                          <th className="text-left p-3">AI Actions</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNodes.map((node) => (
                          <tr key={node.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{node.name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {node.description}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                node.node_type === 'domain' ? 'bg-blue-100 text-blue-800' :
                                node.node_type === 'topic' ? 'bg-green-100 text-green-800' :
                                node.node_type === 'lesson' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {node.node_type}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                node.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                node.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {node.difficulty}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {node.estimated_minutes} min
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateQuestions(node.id, node.name)}
                                  disabled={generationState.isGenerating}
                                  className="text-xs"
                                >
                                  {generationState.isGenerating && 
                                   generationState.type === 'questions' && 
                                   generationState.nodeId === node.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <HelpCircle className="h-3 w-3" />
                                  )}
                                  <span className="ml-1">Questions</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateKeyConcepts(node.id, node.name)}
                                  disabled={generationState.isGenerating}
                                  className="text-xs"
                                >
                                  {generationState.isGenerating && 
                                   generationState.type === 'concepts' && 
                                   generationState.nodeId === node.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3 w-3" />
                                  )}
                                  <span className="ml-1">Concepts</span>
                                </Button>
                              </div>
                            </td>
                            <td className="p-3">
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
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'generation':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  AI Content Generation
                </CardTitle>
                <CardDescription>
                  Generate questions and key concepts using artificial intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2 border-dashed border-purple-300">
                    <CardContent className="pt-6 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                      <h3 className="font-medium mb-2">Generate Questions</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Create multiple-choice questions for any topic using AI
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Select a content node from the Content Nodes tab to generate questions
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('content')}
                      >
                        Go to Content Nodes
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed border-blue-300">
                    <CardContent className="pt-6 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                      <h3 className="font-medium mb-2">Generate Key Concepts</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Create comprehensive study materials and key concepts
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Select a content node from the Content Nodes tab to generate concepts
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('content')}
                      >
                        Go to Content Nodes
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Generation Status */}
                {generationState.isGenerating && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-3" />
                        <div>
                          <p className="font-medium text-purple-900">
                            Generating {generationState.type === 'questions' ? 'Questions' : 'Key Concepts'}...
                          </p>
                          <p className="text-sm text-purple-700">
                            This may take a few moments. Please wait.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                        Export Questions
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
            Create, manage, and generate learning content with AI assistance
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

