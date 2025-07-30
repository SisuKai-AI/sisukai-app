'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  RotateCcw,
  Home,
  AlertTriangle
} from 'lucide-react'

export default function QuickQuizPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{[key: number]: string}>({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [showEndModal, setShowEndModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to access this page.</div>
  }

  const questions = [
    {
      id: 1,
      question: "What is the primary purpose of risk management in project management?",
      options: [
        "To eliminate all project risks",
        "To identify, analyze, and respond to project risks",
        "To increase project budget",
        "To extend project timeline"
      ],
      correct: 1
    },
    {
      id: 2,
      question: "Which of the following is NOT a risk response strategy?",
      options: [
        "Avoid",
        "Mitigate",
        "Transfer",
        "Ignore"
      ],
      correct: 3
    },
    {
      id: 3,
      question: "What is a risk register?",
      options: [
        "A list of project team members",
        "A document that records identified risks and their management plans",
        "A financial report",
        "A project schedule"
      ],
      correct: 1
    },
    {
      id: 4,
      question: "When should risk identification be performed?",
      options: [
        "Only at the beginning of the project",
        "Only when problems occur",
        "Throughout the project lifecycle",
        "Only at the end of the project"
      ],
      correct: 2
    },
    {
      id: 5,
      question: "What is the difference between qualitative and quantitative risk analysis?",
      options: [
        "There is no difference",
        "Qualitative uses numbers, quantitative uses descriptions",
        "Qualitative uses descriptions and rankings, quantitative uses numerical analysis",
        "They are the same process"
      ],
      correct: 2
    }
  ]

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    const score = calculateScore()
    router.push(`/exam/results?type=quick-quiz&score=${score}&total=${questions.length}`)
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      if (answers[index] && parseInt(answers[index]) === q.correct) {
        correct++
      }
    })
    return correct
  }

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return 'answered'
    if (index === currentQuestion) return 'current'
    return 'unanswered'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white'
      case 'current': return 'bg-blue-500 text-white'
      default: return 'bg-gray-200 text-gray-700'
    }
  }

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quick Assessment</h1>
              <p className="text-gray-600 mt-1">Test your knowledge with this quick quiz</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowEndModal(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                End Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{answeredCount}/{questions.length} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator - Responsive and Non-scrollable */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2 max-h-96 overflow-hidden">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 lg:w-full lg:h-12 rounded-lg font-medium transition-colors ${getStatusColor(getQuestionStatus(index))}`}
                    >
                      <span className="lg:hidden">{index + 1}</span>
                      <span className="hidden lg:block">Question {index + 1}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === questions.length - 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    {questions[currentQuestion].question}
                  </h3>
                  
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion] === index.toString()
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={index}
                          checked={answers[currentQuestion] === index.toString()}
                          onChange={(e) => handleAnswerSelect(currentQuestion, e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <Button 
                      onClick={() => setShowEndModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* End Quiz Modal */}
        {showEndModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>End Quiz?</CardTitle>
                <CardDescription>
                  Are you sure you want to submit your quiz? You have answered {answeredCount} out of {questions.length} questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEndModal(false)}
                    className="flex-1"
                  >
                    Continue Quiz
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Submit Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

