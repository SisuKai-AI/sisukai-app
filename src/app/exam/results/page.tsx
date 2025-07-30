'use client'

import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

function ExamResultsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [examType, setExamType] = useState('full-exam')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // Get results from URL parameters
    const scoreParam = searchParams.get('score')
    const correctParam = searchParams.get('correct')
    const totalParam = searchParams.get('total')
    const typeParam = searchParams.get('type')

    if (scoreParam && correctParam && totalParam) {
      setScore(parseInt(scoreParam))
      setCorrect(parseInt(correctParam))
      setTotal(parseInt(totalParam))
    } else {
      // Default values if no parameters
      setScore(75)
      setCorrect(150)
      setTotal(200)
    }

    if (typeParam) {
      setExamType(typeParam)
    }
  }, [user, router, searchParams])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return {
      title: "🎉 Excellent Performance!",
      message: "Congratulations! You have demonstrated strong mastery of the material.",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />
    }
    if (score >= 70) return {
      title: "👍 Good Job!",
      message: "You passed! Consider reviewing areas where you missed questions.",
      icon: <Target className="h-8 w-8 text-blue-500" />
    }
    return {
      title: "📚 Keep Studying!",
      message: "You're on the right track. Review the material and try again.",
      icon: <BookOpen className="h-8 w-8 text-orange-500" />
    }
  }

  const getExamTitle = (type: string) => {
    switch (type) {
      case 'quick-quiz':
        return 'Quiz Results'
      case 'practice':
        return 'Practice Results'
      case 'domain-practice':
        return 'Domain Practice Results'
      default:
        return 'Exam Results'
    }
  }

  const getExamDescription = (type: string) => {
    switch (type) {
      case 'quick-quiz':
        return 'Your performance on the Quick Assessment'
      case 'practice':
        return 'Your performance on the Practice Exam'
      case 'domain-practice':
        return 'Your performance on the Domain-Specific Practice'
      default:
        return 'Your performance on the PMP Full Simulation Exam'
    }
  }

  const scoreInfo = getScoreMessage(score)
  const isPassing = score >= 70

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getExamTitle(examType)}
          </h1>
          <p className="text-gray-600">
            {getExamDescription(examType)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <Card className={`${getScoreBgColor(score)} border-2`}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {scoreInfo.icon}
                  </div>
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {correct} out of {total} questions correct
                  </div>
                  <div className="mb-4">
                    <Progress value={score} className="h-3" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{scoreInfo.title}</h3>
                  <p className="text-gray-600">{scoreInfo.message}</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock domain breakdown */}
                  {[
                    { domain: 'Initiating', score: 85, questions: 13 },
                    { domain: 'Planning', score: 78, questions: 24 },
                    { domain: 'Executing', score: 72, questions: 31 },
                    { domain: 'Monitoring & Controlling', score: 69, questions: 25 },
                    { domain: 'Closing', score: 88, questions: 7 }
                  ].map((domain, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{domain.domain}</span>
                        <span className={`font-semibold ${getScoreColor(domain.score)}`}>
                          {domain.score}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={domain.score} className="flex-1 h-2" />
                        <span className="text-sm text-gray-500">
                          {Math.round((domain.score / 100) * domain.questions)}/{domain.questions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {score >= 80 ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">You're ready for the real exam!</p>
                          <p className="text-sm text-gray-600">Your performance indicates strong preparation.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Continue practicing</p>
                          <p className="text-sm text-gray-600">Take more practice exams to maintain your knowledge.</p>
                        </div>
                      </div>
                    </div>
                  ) : score >= 70 ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Focus on weak areas</p>
                          <p className="text-sm text-gray-600">Review domains where you scored below 75%.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <RotateCcw className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Take more practice exams</p>
                          <p className="text-sm text-gray-600">Additional practice will help improve your confidence.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <BookOpen className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Study the fundamentals</p>
                          <p className="text-sm text-gray-600">Review core concepts before attempting more practice exams.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Use domain-specific practice</p>
                          <p className="text-sm text-gray-600">Focus on individual domains to build knowledge systematically.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                    {isPassing ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-semibold">{score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct:</span>
                  <span className="font-semibold">{correct}/{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-semibold">70%</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/exam/full-sim">
                  <Button className="w-full" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Full Exam
                  </Button>
                </Link>
                
                <Link href="/exam">
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Practice by Domain
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Review the PMBOK Guide thoroughly</p>
                  <p>• Practice with different question formats</p>
                  <p>• Focus on process inputs and outputs</p>
                  <p>• Understand situational questions</p>
                  <p>• Take breaks between study sessions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExamResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExamResultsContent />
    </Suspense>
  )
}

