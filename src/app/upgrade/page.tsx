'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Crown, Star, ArrowRight, Shield, Clock, Users } from 'lucide-react'

export default function UpgradePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (plan: 'pro_monthly' | 'pro_yearly') => {
    if (!user?.id) {
      alert('Please log in to upgrade')
      return
    }

    setLoading(plan)

    try {
      const response = await fetch('/api/checkout/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Paddle checkout
        window.location.href = data.checkout_url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SisuKai</span>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Accelerate Your Learning Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Unlock advanced features, personalized learning paths, and premium content 
            to achieve your certification goals faster than ever before.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Join 10,000+ learners
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Monthly Plan */}
          <Card className="relative hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Pro Monthly</CardTitle>
              </div>
              <CardDescription className="text-base">Perfect for getting started</CardDescription>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <div className="text-sm text-gray-500">Billed monthly</div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Unlimited Certifications</div>
                    <div className="text-sm text-gray-600">Access to all certification paths</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Adaptive Learning Paths</div>
                    <div className="text-sm text-gray-600">AI-powered personalized recommendations</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Advanced Analytics</div>
                    <div className="text-sm text-gray-600">Detailed progress insights</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Priority Support</div>
                    <div className="text-sm text-gray-600">Get help when you need it</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">5 Streak Freezes</div>
                    <div className="text-sm text-gray-600">Protect your learning streak</div>
                  </div>
                </li>
              </ul>
              <Button 
                className="w-full h-12 text-base" 
                onClick={() => handleUpgrade('pro_monthly')}
                disabled={loading === 'pro_monthly'}
              >
                {loading === 'pro_monthly' ? (
                  'Processing...'
                ) : (
                  <>
                    Start Monthly Plan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative border-2 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                🎉 Best Value - Save 31%
              </div>
            </div>
            <CardHeader className="pb-8 pt-8">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Pro Yearly</CardTitle>
              </div>
              <CardDescription className="text-base">Maximum savings and benefits</CardDescription>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-lg text-gray-600">/year</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                Save $149 compared to monthly (31% off)
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Everything in Monthly</div>
                    <div className="text-sm text-gray-600">All monthly features included</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">31% Discount</div>
                    <div className="text-sm text-gray-600">2 months completely free</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Exclusive Yearly Features</div>
                    <div className="text-sm text-gray-600">Early access to new content</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Priority Feature Access</div>
                    <div className="text-sm text-gray-600">Beta features and updates</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Unlimited Streak Freezes</div>
                    <div className="text-sm text-gray-600">Never lose your progress</div>
                  </div>
                </li>
              </ul>
              <Button 
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                onClick={() => handleUpgrade('pro_yearly')}
                disabled={loading === 'pro_yearly'}
              >
                {loading === 'pro_yearly' ? (
                  'Processing...'
                ) : (
                  <>
                    Start Yearly Plan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Upgrade to Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Adaptive Learning</h3>
              <p className="text-gray-600">
                AI-powered personalized learning paths that adapt to your progress, 
                strengths, and learning style for maximum efficiency.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">
                Detailed insights into your learning progress, performance trends, 
                and areas for improvement with actionable recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Support</h3>
              <p className="text-gray-600">
                Priority customer support, exclusive community access, and 
                direct feedback channels with our learning experts.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-8 py-6 bg-gray-50 border-b">
              <h3 className="text-xl font-semibold text-center">Feature Comparison</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-medium text-gray-900">Feature</div>
                <div className="font-medium text-center text-gray-600">Free</div>
                <div className="font-medium text-center text-blue-600">Pro</div>
                
                <div className="py-3 border-t">Certifications Access</div>
                <div className="py-3 border-t text-center">Limited (3)</div>
                <div className="py-3 border-t text-center text-green-600">✓ Unlimited</div>
                
                <div className="py-3 border-t">Learning Paths</div>
                <div className="py-3 border-t text-center">Basic</div>
                <div className="py-3 border-t text-center text-green-600">✓ Adaptive AI</div>
                
                <div className="py-3 border-t">Practice Questions</div>
                <div className="py-3 border-t text-center">50/month</div>
                <div className="py-3 border-t text-center text-green-600">✓ Unlimited</div>
                
                <div className="py-3 border-t">Analytics</div>
                <div className="py-3 border-t text-center">Basic</div>
                <div className="py-3 border-t text-center text-green-600">✓ Advanced</div>
                
                <div className="py-3 border-t">Support</div>
                <div className="py-3 border-t text-center">Community</div>
                <div className="py-3 border-t text-center text-green-600">✓ Priority</div>
                
                <div className="py-3 border-t">Streak Freezes</div>
                <div className="py-3 border-t text-center">2</div>
                <div className="py-3 border-t text-center text-green-600">✓ 5 (Unlimited yearly)</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have Pro access until the end of your billing period.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Is there a money-back guarantee?</h3>
              <p className="text-gray-600">Absolutely! We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your payment in full.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and other payment methods through our secure payment processor Paddle.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Can I switch between monthly and yearly plans?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

