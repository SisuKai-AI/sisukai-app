'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockExams } from '@/lib/mock-data.repository'
import { 
  Clock, 
  Save, 
  Flag, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

export default function FullSimExam() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Mock exam questions
  const mockExamQuestions = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1}: What is the best practice for project management in this scenario?`,
    options: [
      `Option A for question ${i + 1}`,
      `Option B for question ${i + 1}`,
      `Option C for question ${i + 1}`,
      `Option D for question ${i + 1}`
    ],
    correctAnswer: i % 4,
    explanation: `This is the explanation for question ${i + 1}. The correct answer demonstrates proper understanding of project management principles.`,
    domain: ['Initiating', 'Planning', 'Executing', 'Monitoring & Controlling', 'Closing'][i % 5]
  }))
  
  const [currentPage, setCurrentPage] = useState(0)
  const [showEndExamModal, setShowEndExamModal] = useState(false)
  const questionsPerPage = 50
  const totalPages = Math.ceil(mockExamQuestions.length / questionsPerPage)
  
  const getCurrentPageQuestions = () => {
    const startIndex = currentPage * questionsPerPage
    const endIndex = startIndex + questionsPerPage
    return mockExamQuestions.slice(startIndex, endIndex)
  }
  
  const getQuestionNumber = (pageIndex: number) => {
    return currentPage * questionsPerPage + pageIndex + 1
  }
  
  const [timeRemaining, setTimeRemaining] = useState(240 * 60) // 240 minutes in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  const examData = mockExams['cert-pmp-1'].full_sim
  const totalQuestions = examData.questionCount

  // Mock question for demonstration
  const mockQuestion = {
    id: currentQuestion,
    text: `Question ${currentQuestion}: You are managing a software development project and notice that the team's velocity has decreased significantly in the last two sprints. The product owner is concerned about meeting the release deadline. What should be your FIRST action as the project manager?`,
    options: [
      'Immediately add more developers to the team to increase velocity',
      'Conduct a retrospective meeting with the team to identify root causes',
      'Extend the project timeline to accommodate the reduced velocity',
      'Remove some features from the current sprint to reduce workload'
    ]
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          // Auto-submit exam when time runs out
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, router])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }))
  }

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion)
      } else {
        newSet.add(currentQuestion)
      }
      return newSet
    })
  }

  const handleSaveAndResume = () => {
    setShowSaveConfirmation(true)
    setTimeout(() => {
      setShowSaveConfirmation(false)
      router.push('/exam')
    }, 2000)
  }

  const handleSubmitExam = () => {
    setShowEndExamModal(true)
  }
  
  const confirmEndExam = () => {
    // Calculate final score
    let correct = 0
    mockExamQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    
    const percentage = Math.round((correct / mockExamQuestions.length) * 100)
    
    // Redirect to results page with score
    router.push(`/exam/results?score=${percentage}&correct=${correct}&total=${mockExamQuestions.length}`)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const progress = (currentQuestion / totalQuestions) * 100
  const answeredQuestions = Object.keys(selectedAnswers).length
  const isTimeRunningOut = timeRemaining < 600 // Less than 10 minutes

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Save Confirmation */}
      {showSaveConfirmation && (
        <div className="fixed top-20 right-8 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Progress Saved Successfully
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Exam Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PMP Full Simulation Exam</h1>
              <p className="text-gray-600">Question {currentQuestion} of {totalQuestions}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`flex items-center ${isTimeRunningOut ? 'text-red-600' : 'text-gray-700'}`}>
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                {isTimeRunningOut && <AlertTriangle className="h-4 w-4 ml-2" />}
              </div>
              
              <div className="text-sm text-gray-600">
                Answered: {answeredQuestions}/{totalQuestions}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestion}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={flaggedQuestions.has(currentQuestion) ? 'bg-yellow-100 border-yellow-300' : ''}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {flaggedQuestions.has(currentQuestion) ? 'Flagged' : 'Flag'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-gray-900 leading-relaxed text-lg">
                    {mockQuestion.text}
                  </p>
                </div>

                <div className="space-y-3">
                  {mockQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 border rounded-lg transition-all ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="font-medium mr-3 mt-0.5">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleSaveAndResume}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save & Resume Later
                    </Button>

                    {currentQuestion === totalQuestions ? (
                      <Button
                        onClick={handleSubmitExam}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Exam
                      </Button>
                    ) : (
                      <Button onClick={handleNextQuestion}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: Math.min(50, totalQuestions) }, (_, i) => {
                    const questionNum = i + 1
                    const isAnswered = selectedAnswers[questionNum] !== undefined
                    const isFlagged = flaggedQuestions.has(questionNum)
                    const isCurrent = questionNum === currentQuestion

                    let buttonClass = "w-8 h-8 text-xs rounded border "
                    
                    if (isCurrent) {
                      buttonClass += "border-blue-500 bg-blue-500 text-white"
                    } else if (isAnswered && isFlagged) {
                      buttonClass += "border-yellow-500 bg-yellow-100 text-yellow-800"
                    } else if (isAnswered) {
                      buttonClass += "border-green-500 bg-green-100 text-green-800"
                    } else if (isFlagged) {
                      buttonClass += "border-yellow-500 bg-yellow-50 text-yellow-700"
                    } else {
                      buttonClass += "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }

                    return (
                      <button
                        key={questionNum}
                        onClick={() => setCurrentQuestion(questionNum)}
                        className={buttonClass}
                      >
                        {questionNum}
                      </button>
                    )
                  })}
                </div>

                {totalQuestions > 50 && (
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Showing first 50 questions
                  </div>
                )}

                {/* Legend */}
                <div className="mt-6 space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-blue-500 bg-blue-500 rounded mr-2"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-green-500 bg-green-100 rounded mr-2"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-yellow-500 bg-yellow-100 rounded mr-2"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 border border-gray-300 bg-white rounded mr-2"></div>
                    <span>Not answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Exam Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-3">
                      Page {currentPage + 1} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                      >
                        Previous 50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                      >
                        Next 50
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Questions {currentPage * questionsPerPage + 1} - {Math.min((currentPage + 1) * questionsPerPage, mockExamQuestions.length)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* End Exam Button */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSubmitExam}
                  className="w-full bg-red-600 hover:bg-red-700"
                  variant="destructive"
                >
                  End Exam Early
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Submit your answers before time runs out
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* End Exam Confirmation Modal */}
        {showEndExamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">End Exam?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end the exam? You have answered {answeredQuestions} out of {mockExamQuestions.length} questions.
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowEndExamModal(false)}
                >
                  Continue Exam
                </Button>
                <Button
                  onClick={confirmEndExam}
                  className="bg-red-600 hover:bg-red-700"
                >
                  End Exam
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

