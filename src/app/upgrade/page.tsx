'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Shield, 
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'

export default function UpgradePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Please log in to access this page.</div>
  }

  const handleUpgrade = async (plan: string) => {
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      alert(`Upgrade to ${plan} plan initiated! In a real application, this would redirect to payment processing.`)
      setIsProcessing(false)
      // In real app: redirect to payment gateway
      // router.push('/payment/checkout')
    }, 2000)
  }

  const features = {
    free: [
      'Access to 3 certification programs',
      'Basic study materials',
      'Limited practice questions (50 per month)',
      'Community forum access',
      'Basic progress tracking',
      'Email support'
    ],
    pro: [
      'Access to ALL certification programs',
      'Premium study materials & guides',
      'Unlimited practice questions',
      'Full simulation exams',
      'Advanced analytics & insights',
      'Personalized learning paths',
      'Priority support (24/7)',
      'Downloadable resources',
      'Mobile app access',
      'Certificate of completion',
      'Progress sharing & badges',
      'Expert-led webinars'
    ],
    advanced: [
      'Everything in Pro Plan',
      'AI-powered spaced repetition system',
      'Advanced leaderboards & competitions',
      'Custom learning path creation',
      'Team management & collaboration',
      'White-label branding options',
      'API access for integrations',
      'Advanced reporting & analytics',
      'Dedicated account manager',
      'Custom certification creation',
      'Bulk user management',
      'SSO integration',
      'Priority feature requests',
      'Custom training sessions'
    ]
  }

  const pricing = {
    monthly: { price: 29, savings: 0 },
    yearly: { price: 290, savings: 58, monthlyEquivalent: 24.17 }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upgrade to SisuKai Pro and get unlimited access to all certification programs, 
            advanced features, and personalized learning experiences.
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Current Plan: Free</h3>
                  <p className="text-gray-600">You're currently on our free plan with limited access.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Upgrade to unlock</p>
                <p className="font-semibold text-purple-600">Premium Features</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg border">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedPlan === 'monthly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
                selectedPlan === 'yearly'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="border-gray-200">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-medium">
              Most Popular
            </div>
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Pro Plan</CardTitle>
              <CardDescription>Everything you need to succeed</CardDescription>
              <div className="mt-4">
                {selectedPlan === 'yearly' ? (
                  <div>
                    <span className="text-4xl font-bold">${pricing.yearly.monthlyEquivalent}</span>
                    <span className="text-gray-600">/month</span>
                    <div className="text-sm text-green-600 mt-1">
                      Billed yearly (${pricing.yearly.price}) • Save ${pricing.yearly.savings}
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold">${pricing.monthly.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {features.pro.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Plan */}
          <Card className="border-gold-200 relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-600 to-orange-600 text-white px-4 py-1 text-sm font-medium">
              Enterprise
            </div>
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-full">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Advanced Plan</CardTitle>
              <CardDescription>For organizations and power users</CardDescription>
              <div className="mt-4">
                {selectedPlan === 'yearly' ? (
                  <div>
                    <span className="text-4xl font-bold">$79</span>
                    <span className="text-gray-600">/month</span>
                    <div className="text-sm text-green-600 mt-1">
                      Billed yearly ($790) • Save $158
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {features.advanced.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                onClick={() => handleUpgrade(`advanced-${selectedPlan}`)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Upgrade to Advanced
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                AI-powered recommendations and adaptive learning paths tailored to your progress and goals.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Detailed insights into your learning progress, strengths, and areas for improvement.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Priority Support</h3>
              <p className="text-gray-600">
                24/7 expert support to help you succeed in your certification journey.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
              <p className="text-gray-600">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access to Pro features until the end of your billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a money-back guarantee?</h4>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Pro features, we'll refund your payment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I switch between monthly and yearly plans?</h4>
              <p className="text-gray-600">
                Absolutely! You can upgrade to yearly billing at any time to save 20%, or switch back to monthly billing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

