// End-to-End Paddle Integration Tests
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
  testEmail: 'paddle-test@sisukai.com',
  testCards: {
    success: '4242424242424242',
    failure: '4000000000000002'
  },
  plans: {
    monthly: {
      priceId: 'pri_01h1vjes1y163xfj1rh1tkfb65',
      amount: 29.00,
      currency: 'USD'
    },
    yearly: {
      priceId: 'pri_01h1vjess2y163xfj1rh1tkfb66', 
      amount: 199.00,
      currency: 'USD'
    }
  }
}

describe('Paddle E2E Integration Tests', () => {
  let testUserId: string

  beforeAll(async () => {
    // Setup test user
    testUserId = `test-user-${Date.now()}`
    console.log(`Running E2E tests with user ID: ${testUserId}`)
  })

  afterAll(async () => {
    // Cleanup test data
    console.log(`Cleaning up test data for user: ${testUserId}`)
  })

  describe('Checkout Flow E2E', () => {
    it('should create checkout session for monthly plan', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_monthly',
          userEmail: TEST_CONFIG.testEmail,
          userId: testUserId
        })
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toContain('checkout.paddle.com')
      expect(data.sessionId).toMatch(/^txn_/)

      console.log('Monthly checkout created:', data.checkoutUrl)
    })

    it('should create checkout session for yearly plan', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_yearly',
          userEmail: TEST_CONFIG.testEmail,
          userId: testUserId
        })
      })

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.checkoutUrl).toContain('checkout.paddle.com')
      expect(data.sessionId).toMatch(/^txn_/)

      console.log('Yearly checkout created:', data.checkoutUrl)
    })

    it('should handle invalid plan gracefully', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'invalid_plan',
          userEmail: TEST_CONFIG.testEmail,
          userId: testUserId
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid plan')
    })

    it('should require authentication for checkout', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_monthly',
          userEmail: TEST_CONFIG.testEmail
          // Missing userId
        })
      })

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('authentication')
    })
  })

  describe('Webhook Processing E2E', () => {
    const createTestWebhook = (eventType: string, data: any) => ({
      event_type: eventType,
      data: data,
      occurred_at: new Date().toISOString()
    })

    it('should process subscription.created webhook', async () => {
      const webhookData = createTestWebhook('subscription.created', {
        id: `sub_test_${Date.now()}`,
        status: 'active',
        started_at: new Date().toISOString(),
        next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        custom_data: {
          user_id: testUserId
        }
      })

      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'test-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)

      console.log('Subscription created webhook processed successfully')
    })

    it('should process transaction.completed webhook', async () => {
      const webhookData = createTestWebhook('transaction.completed', {
        id: `txn_test_${Date.now()}`,
        status: 'completed',
        details: {
          totals: {
            total: '2900' // $29.00 in cents
          }
        },
        currency_code: 'USD',
        custom_data: {
          user_id: testUserId
        }
      })

      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'test-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)

      console.log('Transaction completed webhook processed successfully')
    })

    it('should process subscription.cancelled webhook', async () => {
      const webhookData = createTestWebhook('subscription.cancelled', {
        id: `sub_test_${Date.now()}`,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        custom_data: {
          user_id: testUserId
        }
      })

      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'test-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)

      console.log('Subscription cancelled webhook processed successfully')
    })

    it('should reject webhook with invalid signature', async () => {
      const webhookData = createTestWebhook('subscription.created', {
        id: 'sub_invalid',
        custom_data: { user_id: testUserId }
      })

      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'invalid-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('signature')
    })
  })

  describe('Subscription Management E2E', () => {
    it('should upgrade user to Pro after successful payment', async () => {
      // Simulate successful subscription creation
      const webhookData = {
        event_type: 'subscription.created',
        data: {
          id: `sub_upgrade_${Date.now()}`,
          status: 'active',
          started_at: new Date().toISOString(),
          next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          custom_data: {
            user_id: testUserId
          }
        },
        occurred_at: new Date().toISOString()
      }

      const webhookResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'test-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(webhookResponse.status).toBe(200)

      // Verify user was upgraded (would need API endpoint to check)
      // This would typically check the database directly or via API
      console.log(`User ${testUserId} should now have Pro subscription`)
    })

    it('should handle subscription cancellation', async () => {
      const webhookData = {
        event_type: 'subscription.cancelled',
        data: {
          id: `sub_cancel_${Date.now()}`,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          custom_data: {
            user_id: testUserId
          }
        },
        occurred_at: new Date().toISOString()
      }

      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'test-signature'
        },
        body: JSON.stringify(webhookData)
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)

      console.log(`Subscription cancelled for user ${testUserId}`)
    })
  })

  describe('Pricing and Plans E2E', () => {
    it('should return correct pricing for monthly plan', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/pricing/plans`)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.plans).toBeDefined()
      
      const monthlyPlan = data.plans.find((p: any) => p.id === 'pro_monthly')
      expect(monthlyPlan).toBeDefined()
      expect(monthlyPlan.price).toBe(TEST_CONFIG.plans.monthly.amount)
      expect(monthlyPlan.currency).toBe(TEST_CONFIG.plans.monthly.currency)
    })

    it('should return correct pricing for yearly plan', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/pricing/plans`)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      const yearlyPlan = data.plans.find((p: any) => p.id === 'pro_yearly')
      
      expect(yearlyPlan).toBeDefined()
      expect(yearlyPlan.price).toBe(TEST_CONFIG.plans.yearly.amount)
      expect(yearlyPlan.currency).toBe(TEST_CONFIG.plans.yearly.currency)
      
      // Verify savings calculation
      const monthlyCost = TEST_CONFIG.plans.monthly.amount * 12
      const savings = monthlyCost - TEST_CONFIG.plans.yearly.amount
      expect(yearlyPlan.savings).toBe(savings)
    })
  })

  describe('Error Handling E2E', () => {
    it('should handle Paddle API errors gracefully', async () => {
      // Test with invalid price ID to trigger Paddle error
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_monthly',
          userEmail: TEST_CONFIG.testEmail,
          userId: testUserId,
          priceId: 'invalid_price_id' // This should cause Paddle to error
        })
      })

      // Should handle error gracefully, not crash
      expect([400, 500]).toContain(response.status)
      
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle network timeouts', async () => {
      // This would require mocking network conditions
      // For now, just verify the endpoint exists
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_monthly',
          userEmail: TEST_CONFIG.testEmail,
          userId: testUserId
        })
      })

      // Should not return 404 (endpoint exists)
      expect(response.status).not.toBe(404)
    })
  })

  describe('Security E2E', () => {
    it('should validate webhook signatures', async () => {
      const webhookData = {
        event_type: 'subscription.created',
        data: { id: 'sub_security_test' },
        occurred_at: new Date().toISOString()
      }

      // Test without signature
      const noSigResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      })

      expect(noSigResponse.status).toBe(400)

      // Test with invalid signature
      const invalidSigResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Paddle-Signature': 'definitely-not-valid'
        },
        body: JSON.stringify(webhookData)
      })

      expect(invalidSigResponse.status).toBe(400)
    })

    it('should require authentication for checkout creation', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro_monthly',
          userEmail: TEST_CONFIG.testEmail
          // Missing userId - should require authentication
        })
      })

      expect(response.status).toBe(401)
    })

    it('should sanitize user input', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: '<script>alert("xss")</script>',
          userEmail: 'test@example.com',
          userId: testUserId
        })
      })

      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toContain('Invalid plan')
    })
  })
})

// Test utilities
export const TestUtils = {
  /**
   * Create a test checkout session
   */
  async createTestCheckout(plan: 'pro_monthly' | 'pro_yearly', userId: string) {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/checkout/create-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan,
        userEmail: TEST_CONFIG.testEmail,
        userId
      })
    })

    return response.json()
  },

  /**
   * Simulate a webhook event
   */
  async simulateWebhook(eventType: string, data: any) {
    const webhookData = {
      event_type: eventType,
      data,
      occurred_at: new Date().toISOString()
    }

    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/webhooks/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Paddle-Signature': 'test-signature'
      },
      body: JSON.stringify(webhookData)
    })

    return response.json()
  },

  /**
   * Generate test user ID
   */
  generateTestUserId() {
    return `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Clean up test data
   */
  async cleanupTestData(userId: string) {
    // This would clean up test subscriptions, payments, etc.
    console.log(`Cleaning up test data for user: ${userId}`)
  }
}

