#!/usr/bin/env node

// Manual Paddle Integration Test Script
// This script tests the Paddle integration manually with real API calls

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  testEmail: 'paddle-manual-test@sisukai.com',
  testCards: {
    success: '4242424242424242',
    failure: '4000000000000002'
  }
}

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey)

class PaddleIntegrationTester {
  constructor() {
    this.testUserId = `manual-test-${Date.now()}`
    this.results = []
  }

  log(message, status = 'INFO') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${status}] ${message}`
    console.log(logMessage)
    this.results.push({ timestamp, status, message })
  }

  async runTest(testName, testFunction) {
    this.log(`Starting test: ${testName}`, 'TEST')
    try {
      await testFunction()
      this.log(`✅ Test passed: ${testName}`, 'PASS')
    } catch (error) {
      this.log(`❌ Test failed: ${testName} - ${error.message}`, 'FAIL')
      console.error(error)
    }
  }

  async testCheckoutCreation() {
    const plans = ['pro_monthly', 'pro_yearly']
    
    for (const plan of plans) {
      await this.runTest(`Checkout Creation - ${plan}`, async () => {
        const response = await fetch(`${CONFIG.baseUrl}/api/checkout/create-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            userEmail: CONFIG.testEmail,
            userId: this.testUserId
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(`Checkout creation failed: ${data.error}`)
        }

        if (!data.checkoutUrl || !data.sessionId) {
          throw new Error('Missing checkoutUrl or sessionId in response')
        }

        this.log(`Checkout URL for ${plan}: ${data.checkoutUrl}`)
        this.log(`Session ID for ${plan}: ${data.sessionId}`)
      })
    }
  }

  async testWebhookProcessing() {
    const webhookTests = [
      {
        name: 'Subscription Created',
        eventType: 'subscription.created',
        data: {
          id: `sub_test_${Date.now()}`,
          status: 'active',
          started_at: new Date().toISOString(),
          next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          custom_data: {
            user_id: this.testUserId
          }
        }
      },
      {
        name: 'Transaction Completed',
        eventType: 'transaction.completed',
        data: {
          id: `txn_test_${Date.now()}`,
          status: 'completed',
          details: {
            totals: { total: '2900' }
          },
          currency_code: 'USD',
          custom_data: {
            user_id: this.testUserId
          }
        }
      },
      {
        name: 'Subscription Cancelled',
        eventType: 'subscription.cancelled',
        data: {
          id: `sub_cancel_${Date.now()}`,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          custom_data: {
            user_id: this.testUserId
          }
        }
      }
    ]

    for (const test of webhookTests) {
      await this.runTest(`Webhook - ${test.name}`, async () => {
        const webhookPayload = {
          event_type: test.eventType,
          data: test.data,
          occurred_at: new Date().toISOString()
        }

        const response = await fetch(`${CONFIG.baseUrl}/api/webhooks/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Paddle-Signature': 'test-signature-for-manual-testing'
          },
          body: JSON.stringify(webhookPayload)
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(`Webhook processing failed: ${result.error}`)
        }

        this.log(`Webhook ${test.eventType} processed successfully`)
      })
    }
  }

  async testPricingAPI() {
    await this.runTest('Pricing API', async () => {
      const response = await fetch(`${CONFIG.baseUrl}/api/pricing/plans`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      
      if (!data.plans || !Array.isArray(data.plans)) {
        throw new Error('Invalid pricing response format')
      }

      const monthlyPlan = data.plans.find(p => p.id === 'pro_monthly')
      const yearlyPlan = data.plans.find(p => p.id === 'pro_yearly')

      if (!monthlyPlan || !yearlyPlan) {
        throw new Error('Missing required pricing plans')
      }

      if (monthlyPlan.price !== 29.00) {
        throw new Error(`Incorrect monthly price: expected 29.00, got ${monthlyPlan.price}`)
      }

      if (yearlyPlan.price !== 199.00) {
        throw new Error(`Incorrect yearly price: expected 199.00, got ${yearlyPlan.price}`)
      }

      this.log(`Monthly plan: $${monthlyPlan.price}`)
      this.log(`Yearly plan: $${yearlyPlan.price}`)
      this.log(`Yearly savings: $${(monthlyPlan.price * 12) - yearlyPlan.price}`)
    })
  }

  async testErrorHandling() {
    const errorTests = [
      {
        name: 'Invalid Plan',
        request: {
          plan: 'invalid_plan',
          userEmail: CONFIG.testEmail,
          userId: this.testUserId
        },
        expectedStatus: 400
      },
      {
        name: 'Missing User ID',
        request: {
          plan: 'pro_monthly',
          userEmail: CONFIG.testEmail
        },
        expectedStatus: 401
      },
      {
        name: 'Invalid Email',
        request: {
          plan: 'pro_monthly',
          userEmail: 'not-an-email',
          userId: this.testUserId
        },
        expectedStatus: 400
      }
    ]

    for (const test of errorTests) {
      await this.runTest(`Error Handling - ${test.name}`, async () => {
        const response = await fetch(`${CONFIG.baseUrl}/api/checkout/create-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.request)
        })

        if (response.status !== test.expectedStatus) {
          throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success !== false) {
          throw new Error('Expected error response to have success: false')
        }

        this.log(`Error handled correctly: ${data.error}`)
      })
    }
  }

  async testDatabaseIntegration() {
    await this.runTest('Database Integration', async () => {
      // Test creating a test user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: this.testUserId,
          email: CONFIG.testEmail,
          first_name: 'Test',
          last_name: 'User',
          subscription_tier: 'free',
          subscription_status: 'inactive'
        })
        .select()
        .single()

      if (profileError && !profileError.message.includes('already exists')) {
        throw new Error(`Failed to create test profile: ${profileError.message}`)
      }

      // Test updating subscription
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          subscription_id: 'sub_test_123'
        })
        .eq('id', this.testUserId)

      if (updateError) {
        throw new Error(`Failed to update subscription: ${updateError.message}`)
      }

      // Test logging payment event
      const { error: logError } = await supabase
        .from('payment_logs')
        .insert({
          user_id: this.testUserId,
          transaction_id: 'txn_test_123',
          amount: 29.00,
          currency: 'USD',
          event_type: 'payment_completed',
          event_data: { test: true }
        })

      if (logError) {
        throw new Error(`Failed to log payment: ${logError.message}`)
      }

      this.log('Database operations completed successfully')
    })
  }

  async testCardProcessing() {
    // Note: This test creates checkout sessions but doesn't actually process payments
    // Real card testing would need to be done manually in the Paddle checkout
    
    const cardTests = [
      {
        name: 'Success Card Checkout',
        card: CONFIG.testCards.success,
        plan: 'pro_monthly'
      },
      {
        name: 'Failure Card Checkout',
        card: CONFIG.testCards.failure,
        plan: 'pro_monthly'
      }
    ]

    for (const test of cardTests) {
      await this.runTest(`Card Processing - ${test.name}`, async () => {
        const response = await fetch(`${CONFIG.baseUrl}/api/checkout/create-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: test.plan,
            userEmail: CONFIG.testEmail,
            userId: this.testUserId,
            metadata: {
              test_card: test.card
            }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(`Checkout creation failed: ${data.error}`)
        }

        this.log(`Checkout created for ${test.name}: ${data.checkoutUrl}`)
        this.log(`Use card ${test.card} to test payment flow`)
      })
    }
  }

  async cleanup() {
    this.log('Cleaning up test data...')
    
    try {
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', this.testUserId)

      // Clean up test payment logs
      await supabase
        .from('payment_logs')
        .delete()
        .eq('user_id', this.testUserId)

      this.log('Cleanup completed')
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, 'WARN')
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Paddle Integration Tests')
    this.log(`Test User ID: ${this.testUserId}`)
    this.log(`Base URL: ${CONFIG.baseUrl}`)

    try {
      await this.testCheckoutCreation()
      await this.testWebhookProcessing()
      await this.testPricingAPI()
      await this.testErrorHandling()
      await this.testDatabaseIntegration()
      await this.testCardProcessing()
    } finally {
      await this.cleanup()
    }

    // Summary
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const total = passed + failed

    this.log('📊 Test Summary:')
    this.log(`Total Tests: ${total}`)
    this.log(`Passed: ${passed}`)
    this.log(`Failed: ${failed}`)
    this.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      this.log('❌ Some tests failed. Check the logs above for details.', 'ERROR')
      process.exit(1)
    } else {
      this.log('✅ All tests passed!', 'SUCCESS')
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PaddleIntegrationTester()
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
}

module.exports = { PaddleIntegrationTester, CONFIG }

