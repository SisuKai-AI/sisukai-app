'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Mail, 
  Phone,
  Calendar, 
  Award, 
  Target,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Star,
  Trophy,
  Zap,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  Eye,
  Clock,
  BookOpen,
  Users
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileData, setProfileData] = useState({
    // Basic Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    
    // Professional Information
    jobTitle: '',
    company: '',
    industry: '',
    yearsOfExperience: '',
    currentSalary: '',
    
    // Educational Background
    highestEducation: '',
    fieldOfStudy: '',
    graduationYear: '',
    certifications: '',
    
    // Location Information
    country: '',
    state: '',
    city: '',
    timezone: '',
    
    // Learning Preferences
    preferredLearningStyle: '',
    studyTimePreference: '',
    weeklyStudyHours: '',
    motivationFactors: [],
    
    // Career Goals
    careerGoals: '',
    targetCertifications: [],
    promotionTimeline: '',
    
    // Personal Preferences
    communicationPreference: '',
    reminderFrequency: '',
    language: 'English',
    
    // Accessibility
    accessibilityNeeds: '',
    fontSizePreference: 'medium',
    
    // Privacy Settings
    profileVisibility: 'private',
    dataSharing: false,
    marketingEmails: true
  })

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const achievements = [
    { id: 1, name: 'First Steps', description: 'Completed your first lesson', icon: '🎯', earned: true },
    { id: 2, name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '⚡', earned: true },
    { id: 3, name: 'Knowledge Seeker', description: 'Completed 10 lessons', icon: '📚', earned: true },
    { id: 4, name: 'Exam Master', description: 'Passed your first practice exam', icon: '🏆', earned: false },
    { id: 5, name: 'Perfectionist', description: 'Scored 100% on an exam', icon: '⭐', earned: false },
    { id: 6, name: 'Dedicated Learner', description: 'Studied for 30 days straight', icon: '🔥', earned: false }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{user.gamification?.xp || 0}</p>
                      <p className="text-xs text-gray-500">XP Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Zap className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{user.gamification?.current_streak || 0}</p>
                      <p className="text-xs text-gray-500">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{user.gamification?.level || 1}</p>
                      <p className="text-xs text-gray-500">Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold">{achievements.filter(a => a.earned).length}</p>
                      <p className="text-xs text-gray-500">Achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.earned 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{achievement.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'personal':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mobile Number</label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <Input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input
                      value={profileData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <Input
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                      placeholder="California"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Input
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                      placeholder="San Francisco"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timezone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Timezone</option>
                      <option value="PST">Pacific Standard Time (PST)</option>
                      <option value="MST">Mountain Standard Time (MST)</option>
                      <option value="CST">Central Standard Time (CST)</option>
                      <option value="EST">Eastern Standard Time (EST)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'professional':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <Input
                      value={profileData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Project Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <Input
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Tech Corp Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <select
                      value={profileData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <select
                      value={profileData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11-15">11-15 years</option>
                      <option value="16+">16+ years</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Career Goals</label>
                  <textarea
                    value={profileData.careerGoals}
                    onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                    placeholder="Describe your career aspirations and goals..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Promotion Timeline</label>
                  <select
                    value={profileData.promotionTimeline}
                    onChange={(e) => handleInputChange('promotionTimeline', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Timeline</option>
                    <option value="6months">Within 6 months</option>
                    <option value="1year">Within 1 year</option>
                    <option value="2years">Within 2 years</option>
                    <option value="3+years">3+ years</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'education':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Educational Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Highest Education</label>
                    <select
                      value={profileData.highestEducation}
                      onChange={(e) => handleInputChange('highestEducation', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Education Level</option>
                      <option value="highschool">High School</option>
                      <option value="associate">Associate Degree</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="doctorate">Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Field of Study</label>
                    <Input
                      value={profileData.fieldOfStudy}
                      onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Computer Science, Business, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Graduation Year</label>
                    <Input
                      type="number"
                      value={profileData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                      disabled={!isEditing}
                      placeholder="2020"
                      min="1950"
                      max="2030"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Certifications</label>
                  <textarea
                    value={profileData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                    placeholder="List your current professional certifications..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Learning Style</label>
                    <select
                      value={profileData.preferredLearningStyle}
                      onChange={(e) => handleInputChange('preferredLearningStyle', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Learning Style</option>
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="reading">Reading/Writing</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Study Time Preference</label>
                    <select
                      value={profileData.studyTimePreference}
                      onChange={(e) => handleInputChange('studyTimePreference', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Time Preference</option>
                      <option value="morning">Morning (6AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 6PM)</option>
                      <option value="evening">Evening (6PM - 10PM)</option>
                      <option value="night">Night (10PM - 6AM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Weekly Study Hours</label>
                    <select
                      value={profileData.weeklyStudyHours}
                      onChange={(e) => handleInputChange('weeklyStudyHours', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Hours</option>
                      <option value="1-5">1-5 hours</option>
                      <option value="6-10">6-10 hours</option>
                      <option value="11-15">11-15 hours</option>
                      <option value="16-20">16-20 hours</option>
                      <option value="20+">20+ hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={profileData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Communication Preference</label>
                    <select
                      value={profileData.communicationPreference}
                      onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Preference</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notifications</option>
                      <option value="none">No Notifications</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reminder Frequency</label>
                    <select
                      value={profileData.reminderFrequency}
                      onChange={(e) => handleInputChange('reminderFrequency', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="none">No Reminders</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size Preference</label>
                    <select
                      value={profileData.fontSizePreference}
                      onChange={(e) => handleInputChange('fontSizePreference', e.target.value)}
                      disabled={!isEditing}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Accessibility Needs</label>
                  <textarea
                    value={profileData.accessibilityNeeds}
                    onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                    placeholder="Describe any accessibility requirements or accommodations needed..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Profile Visibility</label>
                      <p className="text-sm text-gray-600">Control who can see your profile information</p>
                    </div>
                    <select
                      value={profileData.profileVisibility}
                      onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                      disabled={!isEditing}
                      className="p-2 border border-gray-300 rounded-md"
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Data Sharing</label>
                      <p className="text-sm text-gray-600">Allow anonymous data sharing for platform improvement</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.dataSharing}
                      onChange={(e) => handleInputChange('dataSharing', e.target.checked.toString())}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Marketing Emails</label>
                      <p className="text-sm text-gray-600">Receive emails about new features and promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.marketingEmails}
                      onChange={(e) => handleInputChange('marketingEmails', e.target.checked.toString())}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

