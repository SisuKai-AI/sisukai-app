// Core Domain Types - Clean Architecture Entities Layer
// This file defines all core business entities and their relationships

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'advanced';
  role: 'learner' | 'admin';
  createdAt: string;
  lastLoginAt: string;
  profile: UserProfile;
  preferences: UserPreferences;
  gamification: GamificationData;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  timezone: string;
  country: string;
  phoneNumber?: string;
  linkedinProfile?: string;
  bio?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  studyReminders: boolean;
  preferredStudyTime: string;
  difficultyPreference: 'adaptive' | 'challenging' | 'comfortable';
}

export interface GamificationData {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  badges: Badge[];
  weeklyXP: number;
  monthlyXP: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: string;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  category: 'learning' | 'streak' | 'mastery' | 'social';
}

export interface Certification {
  nodeId: string;
  nodeType: 'certification';
  title: string;
  description: string;
  provider: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  price: number;
  rating: number;
  enrolledCount: number;
  topics: Topic[];
  prerequisites: string[];
  learningObjectives: string[];
  examInfo: ExamInfo;
  imageUrl: string;
  category: string;
  tags: string[];
}

export interface Topic {
  nodeId: string;
  nodeType: 'topic';
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  lessons: Lesson[];
  masteryThreshold: number;
  order: number;
}

export interface Lesson {
  nodeId: string;
  nodeType: 'lesson';
  title: string;
  content: LessonContent;
  questions: Question[];
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  keyConcepts: KeyConcept[];
}

export interface LessonContent {
  introduction: string;
  mainContent: ContentSection[];
  summary: string;
  practicalTips: string[];
}

export interface ContentSection {
  heading: string;
  content: string;
  examples?: string[];
  diagrams?: string[];
}

export interface KeyConcept {
  term: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
  relatedConcepts: string[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  question: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  estimatedTime: number;
  domain: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamInfo {
  duration: number;
  questionCount: number;
  passingScore: number;
  retakePolicy: string;
  format: 'multiple-choice' | 'mixed';
  domains: ExamDomain[];
}

export interface ExamDomain {
  name: string;
  percentage: number;
  questionCount: number;
  description: string;
}

export interface UserProgress {
  userId: string;
  certificationId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  overallProgress: number;
  topicProgress: TopicProgress[];
  examAttempts: ExamAttempt[];
  studyStreak: number;
  totalStudyTime: number;
}

export interface TopicProgress {
  topicId: string;
  masteryLevel: number;
  completedLessons: string[];
  timeSpent: number;
  lastAccessedAt: string;
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface ExamAttempt {
  id: string;
  examType: 'full-simulation' | 'quick-quiz' | 'domain-practice';
  startedAt: string;
  completedAt?: string;
  score?: number;
  passed?: boolean;
  timeSpent: number;
  questions: ExamQuestionResult[];
  domain?: string;
}

export interface ExamQuestionResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: string;
}

export interface LearningPath {
  userId: string;
  certificationId: string;
  generatedAt: string;
  isAdaptive: boolean;
  recommendedTopics: RecommendedTopic[];
  estimatedCompletionTime: number;
  difficultyProgression: 'linear' | 'adaptive' | 'accelerated';
}

export interface RecommendedTopic {
  topicId: string;
  priority: number;
  reason: string;
  estimatedTime: number;
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Permissions {
  // Learning Features
  canUseAdaptivePath: boolean;
  canUseAIRecommender: boolean;
  canAccessAdvancedAnalytics: boolean;
  canUseSpacedRepetition: boolean;
  
  // Exam Features
  canTakeFullSimulations: boolean;
  canAccessDetailedResults: boolean;
  canUseExamScheduler: boolean;
  
  // Social Features
  canAccessLeaderboards: boolean;
  canJoinStudyGroups: boolean;
  canShareProgress: boolean;
  
  // Content Features
  canAccessPremiumContent: boolean;
  canDownloadMaterials: boolean;
  canUseOfflineMode: boolean;
  
  // Administrative Features
  canManageUsers: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageCertifications: boolean;
  canAccessAdminPanel: boolean;
}

// Architectural Seams - Future Feature Types
export interface Track {
  id: string;
  name: string;
  description: string;
  certifications: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalXP: number;
  rank: number;
  weeklyXP: number;
  monthlyXP: number;
  achievements: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  certificationId: string;
  isPrivate: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Event Types for Future Analytics
export interface UserEvent {
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

