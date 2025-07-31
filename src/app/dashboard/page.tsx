'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getLearningPathForUser, getCertificationById } from '@/lib/mock-data.repository'
import { getMasteryColor, getMasteryLabel, getStreakEmoji, formatTime } from '@/lib/utils'
import { 
  Trophy, 
  Flame, 
  Star, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Play,
  Lock,
  Zap,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [learningPath, setLearningPath] = useState<any[]>([])
  const [certification, setCertification] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    } else if (!isLoading && user && user.tier === 'admin') {
      router.push('/admin')
    } else if (user) {
      // Load learning path and certification data
      const loadData = async () => {
        try {
          const [pathData, certData] = await Promise.all([
            getLearningPathForUser(user.id, 'cert-pmp-1'),
            getCertificationById('cert-pmp-1')
          ])
          setLearningPath(pathData?.topics || [])
          setCertification(certData)
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        }
      }
      loadData()
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  // Sort learning path based on user tier
  const sortedLearningPath = user.tier === 'pro' 
    ? [...learningPath].sort((a, b) => a.masteryLevel - b.masteryLevel)
    : learningPath

  // Calculate overall progress
  const totalMastery = learningPath.reduce((sum: number, topic: any) => sum + topic.masteryLevel, 0)
  const averageMastery = learningPath.length > 0 ? totalMastery / learningPath.length : 0
  const overallProgress = Math.round(averageMastery * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {user.tier === 'pro' 
              ? 'Your adaptive learning path is optimized based on your progress'
              : 'Upgrade to Pro for personalized learning paths and advanced features'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">XP Points</p>
                  <p className="text-2xl font-bold text-gray-900">{user.gamification.xp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flame className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.gamification.current_streak} {getStreakEmoji(user.gamification.current_streak)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-gray-900">{user.gamification.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Certification */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {certification?.nodeName}
                </CardTitle>
                <CardDescription>
                  {user.tier === 'pro' 
                    ? 'Topics ordered by mastery level (lowest first)'
                    : 'Standard learning sequence'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                <div className="space-y-4">
                  {sortedLearningPath.map((topic, index) => {
                    const masteryPercent = Math.round(topic.masteryLevel * 100)
                    const isLocked = user.tier === 'free' && index > 2 // Free users can only access first 3 topics
                    
                    return (
                      <div
                        key={topic.nodeId}
                        className={`p-4 border rounded-lg transition-all ${
                          isLocked 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                {topic.nodeName}
                              </h3>
                              {isLocked && <Lock className="h-4 w-4 ml-2 text-gray-400" />}
                              {user.tier === 'pro' && !isLocked && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                              {topic.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {topic.estimatedTime}
                              </span>
                              <span>{topic.questionCount} questions</span>
                              <span className="flex items-center">
                                <span className={`font-medium ${getMasteryColor(topic.masteryLevel)}`}>
                                  {getMasteryLabel(topic.masteryLevel)} ({masteryPercent}%)
                                </span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {isLocked ? (
                              <Button variant="outline" disabled size="sm">
                                <Lock className="h-4 w-4 mr-2" />
                                Pro Only
                              </Button>
                            ) : (
                              <Link href={`/learn/${topic.nodeId}`}>
                                <Button size="sm">
                                  <Play className="h-4 w-4 mr-2" />
                                  {masteryPercent > 0 ? 'Continue' : 'Start'}
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        {!isLocked && (
                          <div className="mt-3">
                            <Progress value={masteryPercent} className="h-1" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {user.tier === 'free' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Unlock Your Full Potential</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Upgrade to Pro for adaptive learning paths, unlimited topics, and personalized recommendations.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/upgrade')}>
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
                  {user.tier === 'free' && (
                    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-purple-100 p-2 rounded-full mr-4">
                              <Zap className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Unlock Your Full Potential</h3>
                              <p className="text-gray-600">Upgrade to Pro for unlimited access to all certifications and features.</p>
                            </div>
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => router.push('/upgrade')}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/exam" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-2" />
                    Take Practice Exam
                  </Button>
                </Link>
                <Link href="/certifications" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Certifications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.gamification.achievements.slice(-3).map((achievement, index) => (
                    <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium capitalize">
                        {achievement.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

