'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockExams } from '@/lib/mock-data'
import { 
  Trophy, 
  Clock, 
  Target, 
  BookOpen, 
  Play,
  Lock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ExamHub() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  const examData = mockExams['cert-pmp-1']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Practice Exams
          </h1>
          <p className="text-gray-600 text-lg">
            Test your knowledge with realistic exam simulations for PMP certification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Full Simulation Exam */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Trophy className="h-8 w-8 text-blue-600" />
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <CardTitle className="text-xl">Full Simulation Exam</CardTitle>
              <CardDescription>
                Complete PMP exam simulation with real exam conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{examData.full_sim.questionCount} Questions</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{examData.full_sim.timeLimit} Minutes</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Passing: {examData.full_sim.passingScore}%</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    <span>All Domains</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href="/exam/full-sim">
                    <Button className="w-full" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Start Full Exam
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Quiz */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-green-600" />
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Quick
                </span>
              </div>
              <CardTitle className="text-xl">Quick Assessment</CardTitle>
              <CardDescription>
                Quick knowledge check to assess your current level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{examData.quick_quiz.questionCount} Questions</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{examData.quick_quiz.timeLimit} Minutes</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Mixed Topics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                    <span>No Pressure</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link href="/exam/quick-quiz">
                    <Button variant="outline" className="w-full" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Start Quick Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain-Specific Exams */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Domain-Specific Practice</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examData.domain_specific.map((domain, index) => {
              const isLocked = user.tier === 'free' && index > 0 // Free users can only access first domain
              
              return (
                <Card key={domain.domainId} className={isLocked ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                      {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
                    </div>
                    <CardTitle className="text-lg">{domain.domainName}</CardTitle>
                    <CardDescription>
                      {domain.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{domain.questionCount} Questions</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{domain.timeLimit} Minutes</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t">
                        {isLocked ? (
                          <Button variant="outline" disabled className="w-full">
                            <Lock className="h-4 w-4 mr-2" />
                            Pro Only
                          </Button>
                        ) : (
                          <Link href={`/exam/practice/${domain.domainId}`}>
                            <Button variant="outline" className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              Start Practice
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {user.tier === 'free' && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Unlock All Practice Exams</h3>
              <p className="text-blue-700 mb-4">
                Upgrade to Pro to access domain-specific practice exams, detailed performance analytics, and unlimited attempts.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>

        {/* Exam Tips */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                Exam Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Before You Start</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• Find a quiet environment without distractions</li>
                    <li>• Review key concepts before attempting full simulation</li>
                    <li>• Use domain-specific practice to target weak areas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">During the Exam</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Read each question carefully and completely</li>
                    <li>• Use the process of elimination for difficult questions</li>
                    <li>• Manage your time effectively (1.3 minutes per question)</li>
                    <li>• Use the &quot;Save &amp; Resume&quot; feature if needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

