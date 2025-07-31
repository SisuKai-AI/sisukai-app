'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFeedbackQueue } from '@/lib/mock-data.repository'
import { formatDateTime } from '@/lib/utils'
import { 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Flag,
  Eye,
  X
} from 'lucide-react'

export default function FeedbackQueue() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [feedbackList, setFeedbackList] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    } else if (user && user.role === 'admin') {
      // Load feedback data
      const loadData = async () => {
        try {
          const feedbackData = await getFeedbackQueue()
          setFeedbackList(feedbackData)
        } catch (error) {
          console.error('Error loading feedback data:', error)
        }
      }
      loadData()
    }
  }, [user, isLoading, router])

  if (isLoading || feedbackList.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const handleResolveFeedback = (feedbackId: string) => {
    setFeedbackList(prev => 
      prev.map(feedback => 
        feedback.feedbackId === feedbackId 
          ? { ...feedback, status: 'resolved' }
          : feedback
      )
    )
    setSelectedFeedback(null)
  }

  const handleDismissFeedback = (feedbackId: string) => {
    setFeedbackList(prev => 
      prev.map(feedback => 
        feedback.feedbackId === feedbackId 
          ? { ...feedback, status: 'dismissed' }
          : feedback
      )
    )
    setSelectedFeedback(null)
  }

  const openFeedback = feedbackList.filter(f => f.status === 'open')
  const selectedFeedbackItem = feedbackList.find(f => f.feedbackId === selectedFeedback)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'wrong_answer': return <X className="h-4 w-4" />
      case 'unclear': return <MessageSquare className="h-4 w-4" />
      case 'typo': return <AlertTriangle className="h-4 w-4" />
      case 'outdated': return <Clock className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'wrong_answer': return 'Wrong Answer'
      case 'unclear': return 'Unclear'
      case 'typo': return 'Typo'
      case 'outdated': return 'Outdated'
      default: return reason
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Feedback Detail Modal */}
      {selectedFeedbackItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFeedback(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedFeedbackItem.questionText}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Feedback Reasons</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedbackItem.feedbackReasons.map((reason, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-sm bg-gray-100 text-gray-700"
                      >
                        {getReasonIcon(reason)}
                        <span className="ml-1">{getReasonLabel(reason)}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">User Comment</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedFeedbackItem.userComment}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Submitted by:</span>
                    <p className="text-gray-900">{selectedFeedbackItem.submittedBy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedFeedbackItem.priority)}`}>
                      {selectedFeedbackItem.priority}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <p className="text-gray-900">{formatDateTime(selectedFeedbackItem.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Question ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{selectedFeedbackItem.questionId}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => handleResolveFeedback(selectedFeedbackItem.feedbackId)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDismissFeedback(selectedFeedbackItem.feedbackId)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Feedback Queue
          </h1>
          <p className="text-gray-600 text-lg">
            Review and manage user feedback on questions and content
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Open</p>
                  <p className="text-2xl font-bold text-gray-900">{openFeedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {openFeedback.filter(f => f.priority === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Medium Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {openFeedback.filter(f => f.priority === 'medium').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Priority</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {openFeedback.filter(f => f.priority === 'low').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Open Feedback Items</CardTitle>
            <CardDescription>
              Click on any item to view details and take action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {openFeedback.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending feedback items to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openFeedback.map((feedback) => (
                  <div
                    key={feedback.feedbackId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedFeedback(feedback.feedbackId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority} priority
                          </span>
                          <div className="flex gap-1">
                            {feedback.feedbackReasons.map((reason, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                {getReasonIcon(reason)}
                                <span className="ml-1">{getReasonLabel(reason)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-2">
                          {feedback.questionText}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {feedback.userComment}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {feedback.submittedBy}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateTime(feedback.submittedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

