// Mock Data Repository - Clean Architecture Data Layer
// This file simulates our data layer and includes placeholders for future features

import type { 
  User, 
  Certification, 
  Topic, 
  Lesson, 
  Question, 
  UserProgress, 
  LearningPath,
  LeaderboardEntry,
  Track,
  StudyGroup,
  ExamAttempt
} from '@/core/domain/types'

// --- MOCK DATA ---
export const mockUsers: Record<string, User> = {
  'user-learner-free': {
    id: 'user-learner-free',
    email: 'alex.johnson@example.com',
    name: 'Alex Johnson',
    tier: 'free',
    role: 'learner',
    createdAt: '2024-01-15T10:00:00Z',
    lastLoginAt: '2024-07-30T14:30:00Z',
    profile: {
      firstName: 'Alex',
      lastName: 'Johnson',
      jobTitle: 'Junior Project Coordinator',
      company: 'TechStart Inc.',
      industry: 'Technology',
      experienceLevel: 'beginner',
      learningGoals: ['PMP Certification', 'Leadership Skills'],
      timezone: 'America/New_York',
      country: 'United States',
      phoneNumber: '+1-555-0123',
      bio: 'Aspiring project manager looking to advance my career'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: true,
      studyReminders: true,
      preferredStudyTime: 'evening',
      difficultyPreference: 'comfortable'
    },
    gamification: {
      totalXP: 1250,
      level: 3,
      currentStreak: 5,
      longestStreak: 12,
      achievements: [
        {
          id: 'first-lesson',
          name: 'First Steps',
          description: 'Complete your first lesson',
          iconUrl: '/achievements/first-steps.svg',
          unlockedAt: '2024-01-16T09:00:00Z',
          xpReward: 100
        }
      ],
      badges: [],
      weeklyXP: 350,
      monthlyXP: 1250
    }
  },
  'user-learner-pro': {
    id: 'user-learner-pro',
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    tier: 'pro',
    role: 'learner',
    createdAt: '2023-11-20T08:00:00Z',
    lastLoginAt: '2024-07-30T16:45:00Z',
    profile: {
      firstName: 'Sarah',
      lastName: 'Chen',
      jobTitle: 'Senior Project Manager',
      company: 'Global Solutions Corp',
      industry: 'Consulting',
      experienceLevel: 'intermediate',
      learningGoals: ['Advanced PMP', 'Agile Methodologies', 'Risk Management'],
      timezone: 'America/Los_Angeles',
      country: 'United States',
      phoneNumber: '+1-555-0456',
      linkedinProfile: 'https://linkedin.com/in/sarahchen',
      bio: 'Experienced PM seeking advanced certifications and leadership development'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      studyReminders: true,
      preferredStudyTime: 'morning',
      difficultyPreference: 'adaptive'
    },
    gamification: {
      totalXP: 8750,
      level: 12,
      currentStreak: 23,
      longestStreak: 45,
      achievements: [
        {
          id: 'streak-master',
          name: 'Streak Master',
          description: 'Maintain a 20-day learning streak',
          iconUrl: '/achievements/streak-master.svg',
          unlockedAt: '2024-07-15T12:00:00Z',
          xpReward: 500
        }
      ],
      badges: [
        {
          id: 'pro-learner',
          name: 'Pro Learner',
          description: 'Upgraded to Pro tier',
          iconUrl: '/badges/pro-learner.svg',
          earnedAt: '2024-01-01T00:00:00Z',
          category: 'learning'
        }
      ],
      weeklyXP: 850,
      monthlyXP: 3200
    }
  },
  'user-admin': {
    id: 'user-admin',
    email: 'jordan.smith@sisukai.com',
    name: 'Jordan Smith',
    tier: 'pro',
    role: 'admin',
    createdAt: '2023-06-01T00:00:00Z',
    lastLoginAt: '2024-07-30T18:00:00Z',
    profile: {
      firstName: 'Jordan',
      lastName: 'Smith',
      jobTitle: 'Platform Administrator',
      company: 'SisuKai',
      industry: 'Education Technology',
      experienceLevel: 'advanced',
      learningGoals: ['Platform Management', 'User Experience'],
      timezone: 'UTC',
      country: 'Global',
      phoneNumber: '+1-555-0789',
      bio: 'SisuKai platform administrator and learning experience designer'
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      studyReminders: false,
      preferredStudyTime: 'flexible',
      difficultyPreference: 'challenging'
    },
    gamification: {
      totalXP: 15000,
      level: 20,
      currentStreak: 100,
      longestStreak: 100,
      achievements: [],
      badges: [
        {
          id: 'admin-badge',
          name: 'Platform Administrator',
          description: 'SisuKai platform administrator',
          iconUrl: '/badges/admin.svg',
          earnedAt: '2023-06-01T00:00:00Z',
          category: 'social'
        }
      ],
      weeklyXP: 0,
      monthlyXP: 0
    }
  }
}

export const mockCertifications: Certification[] = [
  {
    nodeId: 'cert-pmp-1',
    nodeType: 'certification',
    title: 'Project Management Professional (PMP)',
    description: 'The globally recognized standard for project management excellence',
    provider: 'Project Management Institute',
    difficulty: 'intermediate',
    estimatedHours: 120,
    price: 299,
    rating: 4.8,
    enrolledCount: 15420,
    topics: [], // Will be populated by getTopicsForCertification
    prerequisites: ['High school diploma', '3 years project management experience'],
    learningObjectives: [
      'Master the five process groups of project management',
      'Apply project management tools and techniques',
      'Understand stakeholder management principles'
    ],
    examInfo: {
      duration: 240,
      questionCount: 200,
      passingScore: 70,
      retakePolicy: 'Wait 30 days between attempts',
      format: 'multiple-choice',
      domains: [
        { name: 'Initiating', percentage: 13, questionCount: 26, description: 'Project initiation processes' },
        { name: 'Planning', percentage: 24, questionCount: 48, description: 'Project planning processes' },
        { name: 'Executing', percentage: 31, questionCount: 62, description: 'Project execution processes' },
        { name: 'Monitoring', percentage: 25, questionCount: 50, description: 'Monitoring and controlling processes' },
        { name: 'Closing', percentage: 7, questionCount: 14, description: 'Project closing processes' }
      ]
    },
    imageUrl: '/certifications/pmp.jpg',
    category: 'Project Management',
    tags: ['PMP', 'PMI', 'Project Management', 'Leadership']
  }
]

export const mockTopics: Topic[] = [
  {
    nodeId: 'topic-scope-1',
    nodeType: 'topic',
    title: 'Scope Management',
    description: 'Learn to define, validate, and control project scope effectively',
    estimatedMinutes: 45,
    difficulty: 'beginner',
    prerequisites: [],
    lessons: [], // Will be populated by getLessonsForTopic
    masteryThreshold: 0.8,
    order: 1
  },
  {
    nodeId: 'topic-risk-1',
    nodeType: 'topic',
    title: 'Risk Management',
    description: 'Identify, analyze, and respond to project risks',
    estimatedMinutes: 60,
    difficulty: 'intermediate',
    prerequisites: ['topic-scope-1'],
    lessons: [],
    masteryThreshold: 0.8,
    order: 2
  },
  {
    nodeId: 'topic-quality-1',
    nodeType: 'topic',
    title: 'Quality Management',
    description: 'Ensure project deliverables meet quality standards',
    estimatedMinutes: 50,
    difficulty: 'intermediate',
    prerequisites: ['topic-scope-1'],
    lessons: [],
    masteryThreshold: 0.8,
    order: 3
  }
]

// --- MOCK REPOSITORY FUNCTIONS ---

export const getUserById = async (userId: string): Promise<User | null> => {
  console.log(`[Repository] Fetching user: ${userId}`)
  return mockUsers[userId] || null
}

export const getAllUsers = async (): Promise<User[]> => {
  console.log('[Repository] Fetching all users')
  return Object.values(mockUsers)
}

export const getCertificationById = async (certId: string): Promise<Certification | null> => {
  console.log(`[Repository] Fetching certification: ${certId}`)
  return mockCertifications.find(cert => cert.nodeId === certId) || null
}

export const getAllCertifications = async (): Promise<Certification[]> => {
  console.log('[Repository] Fetching all certifications')
  return mockCertifications
}

export const getTopicsForCertification = async (certId: string): Promise<Topic[]> => {
  console.log(`[Repository] Fetching topics for certification: ${certId}`)
  return mockTopics
}

export const getTopicById = async (topicId: string): Promise<Topic | null> => {
  console.log(`[Repository] Fetching topic: ${topicId}`)
  return mockTopics.find(topic => topic.nodeId === topicId) || null
}

export const getLearningPathForUser = async (userId: string, certId: string): Promise<LearningPath> => {
  console.log(`[Repository] Generating learning path for user ${userId}, certification ${certId}`)
  
  const user = await getUserById(userId)
  const topics = await getTopicsForCertification(certId)
  
  return {
    userId,
    certificationId: certId,
    generatedAt: new Date().toISOString(),
    isAdaptive: user?.tier === 'pro',
    recommendedTopics: topics.map((topic, index) => ({
      topicId: topic.nodeId,
      priority: index + 1,
      reason: user?.tier === 'pro' ? 'Adaptive recommendation based on your progress' : 'Standard curriculum order',
      estimatedTime: topic.estimatedMinutes,
      prerequisites: topic.prerequisites,
      difficulty: topic.difficulty
    })),
    estimatedCompletionTime: topics.reduce((total, topic) => total + topic.estimatedMinutes, 0),
    difficultyProgression: user?.tier === 'pro' ? 'adaptive' : 'linear'
  }
}

export const getUserProgress = async (userId: string, certId: string): Promise<UserProgress | null> => {
  console.log(`[Repository] Fetching progress for user ${userId}, certification ${certId}`)
  
  // Mock progress data
  return {
    userId,
    certificationId: certId,
    enrolledAt: '2024-01-15T10:00:00Z',
    lastAccessedAt: new Date().toISOString(),
    overallProgress: 0.35,
    topicProgress: [
      {
        topicId: 'topic-scope-1',
        masteryLevel: 0.85,
        completedLessons: ['lesson-scope-1', 'lesson-scope-2'],
        timeSpent: 45,
        lastAccessedAt: '2024-07-29T14:00:00Z',
        attempts: 3,
        correctAnswers: 8,
        totalQuestions: 10
      },
      {
        topicId: 'topic-risk-1',
        masteryLevel: 0.45,
        completedLessons: ['lesson-risk-1'],
        timeSpent: 25,
        lastAccessedAt: '2024-07-30T16:00:00Z',
        attempts: 1,
        correctAnswers: 6,
        totalQuestions: 8
      }
    ],
    examAttempts: [],
    studyStreak: 5,
    totalStudyTime: 180
  }
}

export const getLessonContent = async (lessonId: string): Promise<Lesson | null> => {
  console.log(`[Repository] Fetching lesson content: ${lessonId}`)
  
  // Mock lesson data
  return {
    nodeId: lessonId,
    nodeType: 'lesson',
    title: 'Introduction to Scope Management',
    content: {
      introduction: 'Project scope management is one of the fundamental knowledge areas in project management...',
      mainContent: [
        {
          heading: 'What is Project Scope?',
          content: 'Project scope defines the boundaries of what will and will not be included in the project...',
          examples: ['Website redesign scope', 'Software development scope']
        }
      ],
      summary: 'Effective scope management is critical for project success...',
      practicalTips: ['Always document scope changes', 'Involve stakeholders in scope definition']
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the primary purpose of scope management?',
        options: [
          { id: 'a', text: 'To define project boundaries', isCorrect: true },
          { id: 'b', text: 'To manage project budget', isCorrect: false },
          { id: 'c', text: 'To schedule project tasks', isCorrect: false },
          { id: 'd', text: 'To assign team members', isCorrect: false }
        ],
        correctAnswer: 'a',
        explanation: 'Scope management primarily focuses on defining what is included and excluded from the project.',
        difficulty: 'easy',
        tags: ['scope', 'fundamentals'],
        estimatedTime: 30,
        domain: 'Planning'
      }
    ],
    estimatedMinutes: 15,
    difficulty: 'beginner',
    order: 1,
    keyConcepts: [
      {
        term: 'Project Scope',
        definition: 'The work that needs to be accomplished to deliver a product, service, or result',
        importance: 'high',
        relatedConcepts: ['Work Breakdown Structure', 'Scope Statement']
      }
    ]
  }
}

// --- ARCHITECTURAL SEAMS (Placeholders for future features) ---

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  console.log('ARCHITECTURAL SEAM: Fetching leaderboard data (not implemented in MVP)')
  return [] // Return empty array for now
}

export const getUserEnrollments = async (userId: string): Promise<{ nodeId: string; nodeType: string }[]> => {
  console.log('ARCHITECTURAL SEAM: Fetching all user enrollments (tracks/bundles)')
  // For MVP, just return the single certification enrollment
  return [{ nodeId: 'cert-pmp-1', nodeType: 'certification' }]
}

export const getTracksForUser = async (userId: string): Promise<Track[]> => {
  console.log('ARCHITECTURAL SEAM: Fetching learning tracks (Advanced tier feature)')
  return []
}

export const getStudyGroupsForUser = async (userId: string): Promise<StudyGroup[]> => {
  console.log('ARCHITECTURAL SEAM: Fetching study groups (Social feature)')
  return []
}

export const getAIRecommendations = async (userId: string): Promise<any[]> => {
  console.log('ARCHITECTURAL SEAM: Fetching AI recommendations (Advanced tier feature)')
  return []
}

export const getAdvancedAnalytics = async (userId: string): Promise<any> => {
  console.log('ARCHITECTURAL SEAM: Fetching advanced analytics (Pro/Advanced tier feature)')
  return null
}

// Mock exam questions for testing
export const getExamQuestions = async (examType: string, domain?: string): Promise<Question[]> => {
  console.log(`[Repository] Fetching exam questions for ${examType}${domain ? ` - ${domain}` : ''}`)
  
  return [
    {
      id: 'exam-q1',
      type: 'multiple-choice',
      question: 'Which process group includes the Develop Project Charter process?',
      options: [
        { id: 'a', text: 'Initiating', isCorrect: true },
        { id: 'b', text: 'Planning', isCorrect: false },
        { id: 'c', text: 'Executing', isCorrect: false },
        { id: 'd', text: 'Monitoring and Controlling', isCorrect: false }
      ],
      correctAnswer: 'a',
      explanation: 'Develop Project Charter is part of the Initiating process group.',
      difficulty: 'medium',
      tags: ['process-groups', 'charter'],
      estimatedTime: 60,
      domain: domain || 'Initiating'
    }
  ]
}

// User management functions for admin
export const updateUserRole = async (userId: string, newRole: User['role']): Promise<boolean> => {
  console.log(`[Repository] Updating user ${userId} role to ${newRole}`)
  if (mockUsers[userId]) {
    mockUsers[userId].role = newRole
    return true
  }
  return false
}

export const updateUserTier = async (userId: string, newTier: User['tier']): Promise<boolean> => {
  console.log(`[Repository] Updating user ${userId} tier to ${newTier}`)
  if (mockUsers[userId]) {
    mockUsers[userId].tier = newTier
    return true
  }
  return false
}

export const suspendUser = async (userId: string): Promise<boolean> => {
  console.log(`[Repository] Suspending user ${userId}`)
  // In a real implementation, this would update a suspended flag
  return true
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  console.log(`[Repository] Deleting user ${userId}`)
  if (mockUsers[userId]) {
    delete mockUsers[userId]
    return true
  }
  return false
}

