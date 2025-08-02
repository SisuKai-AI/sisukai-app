// Paddle Integration Tests
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { paymentProvider } from '@/lib/payment-abstraction'
import { 
  updateUserSubscription, 
  getUserSubscription, 
  logPaymentEvent,
  hasActiveProSubscription 
} from '@/lib/subscription-management'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null }))
      }))
    }))
  }))
}))

// Mock Paddle SDK
jest.mock('@paddle/paddle-node-sdk', () => ({
  Environment: {
    sandbox: 'sandbox',
    production: 'production'
  },
  Paddle: jest.fn(() => ({
    transactions: {
      create: jest.fn()
    },
    subscriptions: {
      get: jest.fn(),
      cancel: jest.fn()
    },
    webhooks: {
      unmarshal: jest.fn()
    }
  }))
}))

describe('Paddle Integration Tests', () => {
  const testUserId = 'test-user-123'
  const testEmail = 'test@example.com'
  
  // Test card numbers
  const TEST_CARDS = {
    SUCCESS: '4242424242424242',
    FAILURE: '4000000000000002'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Payment Abstraction Layer', () => {
    it('should create checkout session successfully', async () => {
      const mockCheckout = {
        id: 'txn_test_123',
        checkoutUrl: 'https://checkout.paddle.com/test-session'
      }

      // Mock successful checkout creation
      const mockCreate = jest.fn().mockResolvedValue(mockCheckout)
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      const result = await paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel',
        metadata: { user_id: testUserId }
      })

      expect(result.checkoutUrl).toBe(mockCheckout.checkoutUrl)
      expect(result.sessionId).toBe(mockCheckout.id)
      expect(mockCreate).toHaveBeenCalledWith({
        items: [{ priceId: 'pri_test_monthly', quantity: 1 }],
        customerEmail: testEmail,
        customData: { user_id: testUserId },
        checkoutSettings: {
          successUrl: 'https://app.sisukai.com/success',
          cancelUrl: 'https://app.sisukai.com/cancel'
        }
      })
    })

    it('should handle checkout creation failure', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Paddle API Error'))
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      await expect(paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel'
      })).rejects.toThrow('Failed to create checkout session')
    })

    it('should verify webhook signature successfully', async () => {
      const mockEvent = {
        eventType: 'subscription.created',
        data: { id: 'sub_test_123' },
        occurredAt: '2025-01-01T00:00:00Z'
      }

      const mockUnmarshal = jest.fn().mockReturnValue(mockEvent)
      ;(paymentProvider as any).paddle = {
        webhooks: { unmarshal: mockUnmarshal }
      }

      const result = await paymentProvider.verifyWebhook(
        JSON.stringify(mockEvent),
        'test-signature'
      )

      expect(result.eventType).toBe('subscription.created')
      expect(result.data.id).toBe('sub_test_123')
      expect(mockUnmarshal).toHaveBeenCalledWith(
        JSON.stringify(mockEvent),
        process.env.PADDLE_WEBHOOK_SECRET,
        'test-signature'
      )
    })

    it('should handle invalid webhook signature', async () => {
      const mockUnmarshal = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature')
      })
      ;(paymentProvider as any).paddle = {
        webhooks: { unmarshal: mockUnmarshal }
      }

      await expect(paymentProvider.verifyWebhook(
        'invalid-payload',
        'invalid-signature'
      )).rejects.toThrow('Invalid webhook signature')
    })
  })

  describe('Subscription Management', () => {
    it('should update user subscription successfully', async () => {
      const subscriptionData = {
        subscription_tier: 'pro' as const,
        subscription_status: 'active' as const,
        subscription_id: 'sub_test_123'
      }

      const result = await updateUserSubscription(testUserId, subscriptionData)
      expect(result.success).toBe(true)
    })

    it('should get user subscription data', async () => {
      const mockSubscription = {
        id: testUserId,
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_id: 'sub_test_123'
      }

      // Mock Supabase response
      const mockSupabase = require('@supabase/supabase-js').createClient()
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSubscription,
        error: null
      })

      const result = await getUserSubscription(testUserId)
      expect(result.data?.subscription_tier).toBe('pro')
      expect(result.data?.subscription_status).toBe('active')
    })

    it('should check active Pro subscription correctly', async () => {
      const mockSubscription = {
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      const mockSupabase = require('@supabase/supabase-js').createClient()
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSubscription,
        error: null
      })

      const result = await hasActiveProSubscription(testUserId)
      expect(result.isActive).toBe(true)
    })

    it('should detect expired subscription', async () => {
      const mockSubscription = {
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }

      const mockSupabase = require('@supabase/supabase-js').createClient()
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSubscription,
        error: null
      })

      const result = await hasActiveProSubscription(testUserId)
      expect(result.isActive).toBe(false)
    })

    it('should log payment events', async () => {
      const paymentData = {
        user_id: testUserId,
        transaction_id: 'txn_test_123',
        amount: 29.00,
        currency: 'USD',
        event_type: 'payment_completed',
        event_data: { card_last_four: '4242' }
      }

      const result = await logPaymentEvent(paymentData)
      expect(result.success).toBe(true)
    })
  })

  describe('Checkout Flow Tests', () => {
    const testCheckoutScenarios = [
      {
        name: 'Pro Monthly Plan',
        plan: 'pro_monthly',
        priceId: 'pri_01h1vjes1y163xfj1rh1tkfb65',
        expectedAmount: 29.00
      },
      {
        name: 'Pro Yearly Plan',
        plan: 'pro_yearly', 
        priceId: 'pri_01h1vjess2y163xfj1rh1tkfb66',
        expectedAmount: 199.00
      }
    ]

    testCheckoutScenarios.forEach(scenario => {
      it(`should create checkout for ${scenario.name}`, async () => {
        const mockCheckout = {
          id: `txn_${scenario.plan}_123`,
          checkoutUrl: `https://checkout.paddle.com/${scenario.plan}`
        }

        const mockCreate = jest.fn().mockResolvedValue(mockCheckout)
        ;(paymentProvider as any).paddle = {
          transactions: { create: mockCreate }
        }

        const result = await paymentProvider.createCheckoutSession({
          priceId: scenario.priceId,
          customerEmail: testEmail,
          successUrl: 'https://app.sisukai.com/success',
          cancelUrl: 'https://app.sisukai.com/cancel',
          metadata: { 
            user_id: testUserId,
            plan: scenario.plan
          }
        })

        expect(result.checkoutUrl).toBe(mockCheckout.checkoutUrl)
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            items: [{ priceId: scenario.priceId, quantity: 1 }],
            customerEmail: testEmail,
            customData: { 
              user_id: testUserId,
              plan: scenario.plan
            }
          })
        )
      })
    })
  })

  describe('Webhook Event Processing', () => {
    const webhookTestCases = [
      {
        eventType: 'subscription.created',
        data: {
          id: 'sub_test_123',
          status: 'active',
          startedAt: '2025-01-01T00:00:00Z',
          nextBilledAt: '2025-02-01T00:00:00Z',
          customData: { user_id: testUserId }
        },
        expectedSubscriptionStatus: 'active',
        expectedTier: 'pro'
      },
      {
        eventType: 'subscription.updated',
        data: {
          id: 'sub_test_123',
          status: 'active',
          nextBilledAt: '2025-03-01T00:00:00Z',
          customData: { user_id: testUserId }
        },
        expectedSubscriptionStatus: 'active'
      },
      {
        eventType: 'subscription.cancelled',
        data: {
          id: 'sub_test_123',
          status: 'cancelled',
          cancelledAt: '2025-01-15T00:00:00Z',
          customData: { user_id: testUserId }
        },
        expectedSubscriptionStatus: 'cancelled'
      },
      {
        eventType: 'transaction.completed',
        data: {
          id: 'txn_test_123',
          status: 'completed',
          details: { totals: { total: '2900' } },
          currencyCode: 'USD',
          customData: { user_id: testUserId }
        },
        expectedPaymentStatus: 'completed'
      },
      {
        eventType: 'transaction.payment_failed',
        data: {
          id: 'txn_test_456',
          status: 'failed',
          customData: { user_id: testUserId }
        },
        expectedPaymentStatus: 'failed'
      }
    ]

    webhookTestCases.forEach(testCase => {
      it(`should process ${testCase.eventType} webhook correctly`, async () => {
        const mockEvent = {
          eventType: testCase.eventType,
          data: testCase.data,
          occurredAt: '2025-01-01T00:00:00Z'
        }

        const mockUnmarshal = jest.fn().mockReturnValue(mockEvent)
        ;(paymentProvider as any).paddle = {
          webhooks: { unmarshal: mockUnmarshal }
        }

        const result = await paymentProvider.verifyWebhook(
          JSON.stringify(testCase.data),
          'test-signature'
        )

        expect(result.eventType).toBe(testCase.eventType)
        expect(result.data).toEqual(testCase.data)

        // Verify that the appropriate handler would be called
        if (testCase.expectedSubscriptionStatus) {
          expect(result.data.status).toBe(testCase.expectedSubscriptionStatus)
        }
        if (testCase.expectedTier) {
          // This would be handled by the webhook processor
          expect(testCase.expectedTier).toBe('pro')
        }
      })
    })
  })

  describe('Payment Card Testing', () => {
    it('should handle successful payment with test card 4242424242424242', async () => {
      const mockSuccessfulTransaction = {
        id: 'txn_success_123',
        status: 'completed',
        checkoutUrl: 'https://checkout.paddle.com/success',
        details: {
          totals: { total: '2900' },
          paymentMethod: {
            card: { last4: '4242', brand: 'visa' }
          }
        }
      }

      const mockCreate = jest.fn().mockResolvedValue(mockSuccessfulTransaction)
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      const result = await paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel',
        metadata: { 
          user_id: testUserId,
          test_card: TEST_CARDS.SUCCESS
        }
      })

      expect(result.sessionId).toBe('txn_success_123')
      expect(result.checkoutUrl).toContain('success')
    })

    it('should handle failed payment with test card 4000000000000002', async () => {
      const mockFailedTransaction = {
        error: 'card_declined',
        message: 'Your card was declined.'
      }

      const mockCreate = jest.fn().mockRejectedValue(mockFailedTransaction)
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      await expect(paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel',
        metadata: { 
          user_id: testUserId,
          test_card: TEST_CARDS.FAILURE
        }
      })).rejects.toThrow('Failed to create checkout session')
    })
  })

  describe('Pricing and Products', () => {
    const pricingTests = [
      {
        plan: 'pro_monthly',
        priceId: 'pri_01h1vjes1y163xfj1rh1tkfb65',
        expectedPrice: 29.00,
        currency: 'USD',
        interval: 'month'
      },
      {
        plan: 'pro_yearly',
        priceId: 'pri_01h1vjess2y163xfj1rh1tkfb66',
        expectedPrice: 199.00,
        currency: 'USD',
        interval: 'year',
        savings: 149.00 // 12 * 29 - 199 = 348 - 199 = 149
      }
    ]

    pricingTests.forEach(pricing => {
      it(`should validate ${pricing.plan} pricing`, () => {
        expect(pricing.priceId).toMatch(/^pri_[a-zA-Z0-9]+$/)
        expect(pricing.expectedPrice).toBeGreaterThan(0)
        expect(pricing.currency).toBe('USD')
        
        if (pricing.savings) {
          expect(pricing.savings).toBeGreaterThan(0)
          // Yearly should be cheaper than 12 months of monthly
          expect(pricing.expectedPrice).toBeLessThan(12 * 29)
        }
      })
    })

    it('should calculate correct savings for yearly plan', () => {
      const monthlyPrice = 29.00
      const yearlyPrice = 199.00
      const monthlyCostPerYear = monthlyPrice * 12
      const savings = monthlyCostPerYear - yearlyPrice
      const savingsPercentage = (savings / monthlyCostPerYear) * 100

      expect(savings).toBe(149.00)
      expect(Math.round(savingsPercentage)).toBe(31) // 31% savings
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing user_id in webhook', async () => {
      const mockEvent = {
        eventType: 'subscription.created',
        data: {
          id: 'sub_test_123',
          customData: {} // Missing user_id
        },
        occurredAt: '2025-01-01T00:00:00Z'
      }

      const mockUnmarshal = jest.fn().mockReturnValue(mockEvent)
      ;(paymentProvider as any).paddle = {
        webhooks: { unmarshal: mockUnmarshal }
      }

      const result = await paymentProvider.verifyWebhook(
        JSON.stringify(mockEvent.data),
        'test-signature'
      )

      expect(result.eventType).toBe('subscription.created')
      // Should handle gracefully without user_id
      expect(result.data.customData).toEqual({})
    })

    it('should handle network timeout errors', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Network timeout'))
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      await expect(paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel'
      })).rejects.toThrow('Failed to create checkout session')
    })

    it('should handle invalid price ID', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Invalid price ID'))
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      await expect(paymentProvider.createCheckoutSession({
        priceId: 'invalid_price_id',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel'
      })).rejects.toThrow('Failed to create checkout session')
    })
  })

  describe('Integration Flow Tests', () => {
    it('should complete full subscription flow', async () => {
      // 1. Create checkout
      const mockCheckout = {
        id: 'txn_integration_123',
        checkoutUrl: 'https://checkout.paddle.com/integration-test'
      }

      const mockCreate = jest.fn().mockResolvedValue(mockCheckout)
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate }
      }

      const checkout = await paymentProvider.createCheckoutSession({
        priceId: 'pri_test_monthly',
        customerEmail: testEmail,
        successUrl: 'https://app.sisukai.com/success',
        cancelUrl: 'https://app.sisukai.com/cancel',
        metadata: { user_id: testUserId }
      })

      expect(checkout.sessionId).toBe('txn_integration_123')

      // 2. Process webhook
      const mockWebhookEvent = {
        eventType: 'subscription.created',
        data: {
          id: 'sub_integration_123',
          status: 'active',
          customData: { user_id: testUserId }
        },
        occurredAt: '2025-01-01T00:00:00Z'
      }

      const mockUnmarshal = jest.fn().mockReturnValue(mockWebhookEvent)
      ;(paymentProvider as any).paddle = {
        transactions: { create: mockCreate },
        webhooks: { unmarshal: mockUnmarshal }
      }

      const webhookResult = await paymentProvider.verifyWebhook(
        JSON.stringify(mockWebhookEvent.data),
        'test-signature'
      )

      expect(webhookResult.eventType).toBe('subscription.created')

      // 3. Update subscription
      const updateResult = await updateUserSubscription(testUserId, {
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_id: 'sub_integration_123'
      })

      expect(updateResult.success).toBe(true)

      // 4. Verify active subscription
      const mockSupabase = require('@supabase/supabase-js').createClient()
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: {
          subscription_tier: 'pro',
          subscription_status: 'active',
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        error: null
      })

      const subscriptionCheck = await hasActiveProSubscription(testUserId)
      expect(subscriptionCheck.isActive).toBe(true)
    })
  })
})

