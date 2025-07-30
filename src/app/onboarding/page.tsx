'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  BookOpen, 
  Target,
  Clock,
  Award,
  Sparkles,
  Users,
  TrendingUp
} from 'lucide-react'

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information - Pre-populate from user profile
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    
    // Learning Goals
    primaryGoal: '',
    targetCertification: '',
    timeCommitment: '',
    experience: '',
    
    // Preferences
    learningStyle: '',
    studyTime: '',
    notifications: true
  })

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to access this page.</div>
  }

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save onboarding data and redirect to certification
    alert('Onboarding completed! Redirecting to your selected certification...')
    router.push('/certifications')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-6 w-6 mr-2" />
                Welcome to SisuKai!
              </CardTitle>
              <CardDescription>
                Let's start with some basic information to personalize your learning experience.
                {(user?.firstName || user?.lastName) && (
                  <span className="block mt-2 text-green-600 text-sm">
                    ✓ We've pre-filled some information from your profile
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2" />
                Your Learning Goals
              </CardTitle>
              <CardDescription>
                Help us understand what you want to achieve with SisuKai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What's your primary goal?</label>
                <div className="space-y-2">
                  {[
                    'Get certified for career advancement',
                    'Learn new skills for current role',
                    'Prepare for job interviews',
                    'Personal development',
                    'Academic requirements'
                  ].map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        type="radio"
                        name="primaryGoal"
                        value={goal}
                        checked={formData.primaryGoal === goal}
                        onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                        className="mr-3"
                      />
                      <span>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Which certification interests you most?</label>
                <select
                  value={formData.targetCertification}
                  onChange={(e) => handleInputChange('targetCertification', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a certification</option>
                  <option value="pmp">Project Management Professional (PMP)</option>
                  <option value="cissp">Certified Information Systems Security Professional (CISSP)</option>
                  <option value="aws">AWS Certified Solutions Architect</option>
                  <option value="scrum">Certified ScrumMaster (CSM)</option>
                  <option value="itil">ITIL Foundation</option>
                  <option value="six-sigma">Six Sigma Green Belt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How much time can you commit weekly?</label>
                <select
                  value={formData.timeCommitment}
                  onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select time commitment</option>
                  <option value="1-3">1-3 hours per week</option>
                  <option value="4-6">4-6 hours per week</option>
                  <option value="7-10">7-10 hours per week</option>
                  <option value="10+">More than 10 hours per week</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Learning Preferences
              </CardTitle>
              <CardDescription>
                Tell us how you prefer to learn so we can customize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What's your experience level?</label>
                <div className="space-y-2">
                  {[
                    'Beginner - New to this field',
                    'Intermediate - Some experience',
                    'Advanced - Experienced professional',
                    'Expert - Industry veteran'
                  ].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="experience"
                        value={level}
                        checked={formData.experience === level}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="mr-3"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How do you learn best?</label>
                <select
                  value={formData.learningStyle}
                  onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select learning style</option>
                  <option value="visual">Visual (diagrams, charts, images)</option>
                  <option value="auditory">Auditory (videos, podcasts, discussions)</option>
                  <option value="reading">Reading/Writing (text, notes, articles)</option>
                  <option value="kinesthetic">Hands-on (practice, simulations)</option>
                  <option value="mixed">Mixed approach</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">When do you prefer to study?</label>
                <select
                  value={formData.studyTime}
                  onChange={(e) => handleInputChange('studyTime', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select study time</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 10PM)</option>
                  <option value="night">Night (10PM - 6AM)</option>
                  <option value="flexible">Flexible schedule</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <label className="font-medium">Enable study reminders</label>
                  <p className="text-sm text-gray-600">Get notifications to help you stay on track</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                You're All Set!
              </CardTitle>
              <CardDescription>
                Review your information and start your learning journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Target Certification:</span>
                  <span>{formData.targetCertification || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Weekly Commitment:</span>
                  <span>{formData.timeCommitment || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Experience Level:</span>
                  <span>{formData.experience || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Learning Style:</span>
                  <span>{formData.learningStyle || 'Not specified'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Join 10,000+ Learners</h4>
                  <p className="text-sm text-gray-600">Part of our growing community</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Earn Certificates</h4>
                  <p className="text-sm text-gray-600">Industry-recognized credentials</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Track Progress</h4>
                  <p className="text-sm text-gray-600">Monitor your learning journey</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Free Plan Limitations</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Access to 3 certification programs</li>
                  <li>• 50 practice questions per month</li>
                  <li>• Basic study materials</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => router.push('/upgrade')}
                >
                  Upgrade to Pro for Full Access
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Let's Get You Started
          </h1>
          <p className="text-gray-600">
            Complete this quick setup to personalize your learning experience
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Setup
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

