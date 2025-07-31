'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  Sparkles,
  Target,
  Award,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  tier: 'free' | 'pro' | 'admin'
  role: 'learner' | 'admin'
  total_xp: number
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

interface LearningTopic {
  id: string
  name: string
  description: string
  estimated_minutes: number
  masteryLevel: number
  lastAttempted: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  isLocked: boolean
}

interface GamificationData {
  total_xp: number
  current_level: number
  current_level_xp: number
  xp_for_next_level: number
  progress_to_next_level: number
  current_streak: number
  longest_streak: number
  last_activity_date: string
  recent_activities: Array<{
    xp_amount: number
    activity_type: string
    created_at: string
  }>
}

interface StreakData {
  current_streak: number
  longest_streak: number
  last_activity_date: string
  qualifies_for_daily: boolean
  status: {
    status: 'active' | 'at_risk' | 'broken' | 'new'
    message: string
    color: 'green' | 'yellow' | 'red' | 'blue'
    action?: string
  }
  next_milestone: {
    next_milestone: number
    days_to_milestone: number
    milestone_name: string
    reward_preview: string
  }
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [learningPath, setLearningPath] = useState<LearningTopic[]>([])
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/')
      return
    }

    loadDashboardData()
  }, [user, loading, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('User ID not available')
      }

      // Load user profile
      const profileResponse = await fetch(`/api/user/profile?user_id=${user.id}`)
      if (!profileResponse.ok) {
        throw new Error('Failed to load profile')
      }
      const profileData = await profileResponse.json()
      setProfile(profileData)

      // Load gamification data
      const xpResponse = await fetch(`/api/gamification/xp?user_id=${user.id}`)
      if (xpResponse.ok) {
        const xpData = await xpResponse.json()
        setGamificationData(xpData)
      }

      // Load streak data
      const streakResponse = await fetch(`/api/gamification/streaks?user_id=${user.id}`)
      if (streakResponse.ok) {
        const streakDataResponse = await streakResponse.json()
        setStreakData(streakDataResponse)
      }

      // Load learning path (mock data for now)
      const mockLearningPath: LearningTopic[] = [
        {
          id: 'topic-integration-1',
          name: 'Project Integration Management',
          description: 'Processes and activities to identify, define, combine, unify, and coordinate the various processes and project management activities',
          estimated_minutes: 45,
          masteryLevel: 0.3,
          lastAttempted: null,
          difficulty: 'medium',
          isLocked: false
        },
        {
          id: 'topic-scope-1',
          name: 'Project Scope Management',
          description: 'Processes required to ensure that the project includes all the work required',
          estimated_minutes: 40,
          masteryLevel: 0.0,
          lastAttempted: null,
          difficulty: 'medium',
          isLocked: profileData?.tier === 'free'
        },
        {
          id: 'topic-schedule-1',
          name: 'Project Schedule Management',
          description: 'Processes required to manage the timely completion of the project',
          estimated_minutes: 50,
          masteryLevel: 0.0,
          lastAttempted: null,
          difficulty: 'hard',
          isLocked: profileData?.tier === 'free'
        }
      ]
      setLearningPath(mockLearningPath)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getMasteryColor = (level: number) => {
    if (level < 0.2) return 'bg-red-500'
    if (level < 0.4) return 'bg-orange-500'
    if (level < 0.6) return 'bg-yellow-500'
    if (level < 0.8) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getMasteryLabel = (level: number) => {
    if (level < 0.2) return 'Beginner'
    if (level < 0.4) return 'Learning'
    if (level < 0.6) return 'Developing'
    if (level < 0.8) return 'Proficient'
    return 'Advanced'
  }

  const getStreakColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'at_risk': return 'text-yellow-600'
      case 'broken': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">No profile data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.first_name || profile.email.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            {profile.tier === 'pro' 
              ? 'Your adaptive learning path is optimized based on your progress'
              : 'Continue your learning journey with personalized content'
            }
          </p>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* XP and Level */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">XP Points</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {gamificationData?.total_xp || 0}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              {gamificationData && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Level {gamificationData.current_level}</span>
                    <span>{gamificationData.current_level_xp}/{gamificationData.xp_for_next_level}</span>
                  </div>
                  <Progress value={gamificationData.progress_to_next_level} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {streakData?.current_streak || 0}
                  </p>
                </div>
                <Flame className="h-8 w-8 text-orange-600" />
              </div>
              {streakData && (
                <div className="mt-2">
                  <p className={`text-sm ${getStreakColor(streakData.status.status)}`}>
                    {streakData.status.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {gamificationData?.current_level || 1}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {gamificationData?.progress_to_next_level.toFixed(0) || 0}% to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Longest Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Best Streak</p>
                  <p className="text-2xl font-bold text-green-600">
                    {streakData?.longest_streak || 0}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Personal record</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Streak Milestone Progress */}
        {streakData?.next_milestone && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Next Streak Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{streakData.next_milestone.milestone_name}</h3>
                  <p className="text-sm text-gray-600">{streakData.next_milestone.reward_preview}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {streakData.next_milestone.days_to_milestone}
                  </p>
                  <p className="text-sm text-gray-600">days to go</p>
                </div>
              </div>
              <Progress 
                value={(streakData.current_streak / streakData.next_milestone.next_milestone) * 100} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{streakData.current_streak} days</span>
                <span>{streakData.next_milestone.next_milestone} days</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Path */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Learning Path
                </CardTitle>
                <CardDescription>
                  {profile.tier === 'pro' 
                    ? 'Topics ordered by mastery level (lowest first)'
                    : 'Continue with your personalized learning journey'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPath.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                        <div className="flex items-center gap-2">
                          {topic.isLocked ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMasteryColor(topic.masteryLevel)} text-white`}>
                                {getMasteryLabel(topic.masteryLevel)}
                              </span>
                              <span className="text-sm text-gray-500">{Math.round(topic.masteryLevel * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {topic.estimated_minutes} min
                          </span>
                          <span className="capitalize">{topic.difficulty}</span>
                        </div>
                        
                        {topic.isLocked ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Pro Only</span>
                            <Button size="sm" variant="outline" asChild>
                              <Link href="/upgrade">Upgrade</Link>
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" asChild>
                            <Link href={`/learn/${topic.id}`}>
                              <Play className="h-4 w-4 mr-1" />
                              Continue
                            </Link>
                          </Button>
                        )}
                      </div>
                      
                      {!topic.isLocked && (
                        <div className="mt-3">
                          <Progress value={topic.masteryLevel * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            {gamificationData?.recent_activities && gamificationData.recent_activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gamificationData.recent_activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {activity.activity_type === 'question_correct' && 'Correct Answer'}
                            {activity.activity_type === 'lesson_complete' && 'Lesson Complete'}
                            {activity.activity_type === 'streak_bonus' && 'Streak Bonus'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          +{activity.xp_amount} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/exam">
                      <Trophy className="h-4 w-4 mr-2" />
                      Take Practice Exam
                    </Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/certifications">
                      <Award className="h-4 w-4 mr-2" />
                      Browse Certifications
                    </Link>
                  </Button>
                  {profile.tier === 'free' && (
                    <Button className="w-full" asChild>
                      <Link href="/upgrade">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streakData?.current_streak > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Streak Master</p>
                        <p className="text-xs text-gray-500">{streakData.current_streak} day streak</p>
                      </div>
                    </div>
                  )}
                  
                  {gamificationData?.current_level && gamificationData.current_level > 1 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Level Up</p>
                        <p className="text-xs text-gray-500">Reached level {gamificationData.current_level}</p>
                      </div>
                    </div>
                  )}

                  {(!streakData?.current_streak || streakData.current_streak === 0) && 
                   (!gamificationData?.current_level || gamificationData.current_level <= 1) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Complete lessons to earn achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

