'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  getLessonQuestions, 
  getLessonKeyConcepts, 
  getContentNode,
  getUserMastery,
  Question,
  KeyConcept,
  ContentNode
} from '@/lib/supabase-lesson-queries'
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
  Trophy,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const lessonId = params.lessonId as string

  // State management
  const [contentNode, setContentNode] = useState<ContentNode | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [keyConcepts, setKeyConcepts] = useState<KeyConcept[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showKeyConcepts, setShowKeyConcepts] = useState(false)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)

  // Load lesson data
  useEffect(() => {
    if (!user || !lessonId) return

    const loadLessonData = async () => {
      try {
        setLoading(true)
        
        // Load content node info
        const node = await getContentNode(lessonId)
        setContentNode(node)

        // Load questions and key concepts
        const [questionsData, conceptsData] = await Promise.all([
          getLessonQuestions(lessonId),
          getLessonKeyConcepts(lessonId)
        ])

        setQuestions(questionsData)
        setKeyConcepts(conceptsData)
        setUserAnswers(new Array(questionsData.length).fill(null))

        // Load user's current mastery for this topic
        if (user.id) {
          await getUserMastery(user.id, lessonId)
        }

      } catch (error) {
        console.error('Error loading lesson data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLessonData()
  }, [user, lessonId])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const handleAnswerSelect = (optionIndex: number) => {
    if (showAnswer) return
    setSelectedAnswer(optionIndex)
  }

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion || !user) return

    setSubmittingAnswer(true)

    try {
      // Submit answer to backend for checking and mastery update
      const response = await fetch('/api/learn/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          question_id: currentQuestion.id,
          node_id: lessonId,
          selected_option: selectedAnswer,
          question_index: currentQuestionIndex,
          total_questions: questions.length
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update local state
        const newUserAnswers = [...userAnswers]
        newUserAnswers[currentQuestionIndex] = selectedAnswer
        setUserAnswers(newUserAnswers)
        
        // Update score and XP
        if (result.is_correct) {
          setScore(score + 1)
          setXpEarned(xpEarned + result.xp_earned)
        }
        
        setShowAnswer(true)
      } else {
        console.error('Failed to submit answer')
        alert('Failed to submit answer. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Error submitting answer. Please try again.')
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowAnswer(false)
    } else {
      // Lesson complete
      setLessonComplete(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1])
      setShowAnswer(userAnswers[currentQuestionIndex - 1] !== null)
    }
  }

  const isCorrectAnswer = (optionIndex: number) => {
    return currentQuestion && optionIndex === currentQuestion.correct_option_index
  }

  const getOptionStyle = (optionIndex: number) => {
    if (!showAnswer) {
      return selectedAnswer === optionIndex 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-gray-300'
    }

    if (isCorrectAnswer(optionIndex)) {
      return 'border-green-500 bg-green-50'
    }

    if (selectedAnswer === optionIndex && !isCorrectAnswer(optionIndex)) {
      return 'border-red-500 bg-red-50'
    }

    return 'border-gray-200'
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access lessons.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading lesson...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!contentNode || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
              <p className="text-gray-600 mb-4">
                This lesson doesn't have any questions yet. Please check back later.
              </p>
              <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (lessonComplete) {
    const finalScore = (score / questions.length) * 100
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
              <p className="text-gray-600 mb-6">{contentNode.name}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{score}/{questions.length}</p>
                  <p className="text-sm text-gray-600">Questions Correct</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-600">{Math.round(finalScore)}%</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-600">+{xpEarned}</p>
                  <p className="text-sm text-gray-600">XP Earned</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/dashboard">
                  <Button className="w-full">Return to Dashboard</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setCurrentQuestionIndex(0)
                    setSelectedAnswer(null)
                    setShowAnswer(false)
                    setUserAnswers(new Array(questions.length).fill(null))
                    setScore(0)
                    setXpEarned(0)
                    setLessonComplete(false)
                  }}
                >
                  Retake Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contentNode.name}</h1>
              <p className="text-gray-600">{contentNode.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">XP Earned</p>
                <p className="text-lg font-semibold text-purple-600">+{xpEarned}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeyConcepts(true)}
                className="flex items-center"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Key Concepts
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <div className="flex space-x-1">
                  {currentQuestion.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-medium mb-6">{currentQuestion.question}</h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${getOptionStyle(index)}`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full border-2 border-current mr-3 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {showAnswer && isCorrectAnswer(index) && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    )}
                    {showAnswer && selectedAnswer === index && !isCorrectAnswer(index) && (
                      <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showAnswer && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {!showAnswer ? (
            <Button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null || submittingAnswer}
            >
              {submittingAnswer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Answer'
              )}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Complete Lesson' : 'Next Question'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Key Concepts Drawer */}
      {showKeyConcepts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Key Concepts
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyConcepts(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {keyConcepts.length > 0 ? (
                <div className="space-y-4">
                  {keyConcepts.map((concept) => (
                    <div key={concept.id} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-medium mb-2">{concept.title}</h3>
                      <p className="text-gray-600">{concept.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No key concepts available for this lesson yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

