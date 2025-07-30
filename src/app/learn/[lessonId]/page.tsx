'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockLessons, getLessonContent } from '@/lib/mock-data'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Lightbulb,
  Clock,
  Target,
  Award,
  X,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  questionId: string
  questionType: string
  questionData: {
    questionText: string
    options: string[]
    correctOptionIndex: number
  }
  explanation: string
  difficulty: string
  tags: string[]
}

interface KeyConcept {
  conceptId: string
  conceptTitle: string
  conceptBody: string
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const lessonId = params.lessonId as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showKeyConcepts, setShowKeyConcepts] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [showXPAnimation, setShowXPAnimation] = useState(false)

  const lessonContent = getLessonContent(lessonId)
  const { questions, keyConcepts } = lessonContent

  const currentQuestion: Question | null = questions[currentQuestionIndex] || null
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (!showFeedback) {
      setSelectedAnswer(optionIndex)
    }
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return

    setShowFeedback(true)
    
    // Award XP if correct
    if (selectedAnswer === currentQuestion.questionData.correctOptionIndex) {
      const xpAwarded = 10
      setEarnedXP(prev => prev + xpAwarded)
      setShowXPAnimation(true)
      setTimeout(() => setShowXPAnimation(false), 2000)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Lesson completed
      router.push('/dashboard')
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const isCorrect = selectedAnswer === currentQuestion.questionData.correctOptionIndex

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* XP Animation */}
      {showXPAnimation && (
        <div className="fixed top-20 right-8 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            +10 XP
          </div>
        </div>
      )}

      {/* Key Concepts Modal */}
      {showKeyConcepts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
                  Key Concepts
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyConcepts(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {keyConcepts.map((concept: KeyConcept) => (
                  <div key={concept.conceptId} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {concept.conceptTitle}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {concept.conceptBody}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowKeyConcepts(true)}
                className="flex items-center"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Key Concepts
              </Button>
              <div className="text-sm text-gray-600">
                XP Earned: {earnedXP}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.questionData.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.questionData.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 border rounded-lg transition-all "
                
                if (showFeedback) {
                  if (index === currentQuestion.questionData.correctOptionIndex) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800"
                  } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800"
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600"
                  }
                } else {
                  if (index === selectedAnswer) {
                    buttonClass += "border-blue-500 bg-blue-50 text-blue-800"
                  } else {
                    buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                      {showFeedback && index === currentQuestion.questionData.correctOptionIndex && (
                        <CheckCircle className="h-5 w-5 ml-auto text-green-600" />
                      )}
                      {showFeedback && index === selectedAnswer && !isCorrect && (
                        <XCircle className="h-5 w-5 ml-auto text-red-600" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback Section */}
            {showFeedback && (
              <div className="mt-6 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                <div className="flex items-start">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="space-x-3">
                {!showFeedback ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswer === null}
                    className="px-8"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="px-8"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Lesson' : 'Next Question'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Info */}
        <div className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <span>Difficulty: <span className="capitalize font-medium">{currentQuestion.difficulty}</span></span>
            <span>•</span>
            <span>Tags: {currentQuestion.tags.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

