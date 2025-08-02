// Paddle Payment Abstraction Layer
import { Environment, Paddle } from '@paddle/paddle-node-sdk'

interface PaymentProvider {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse>
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>
  getSubscription(subscriptionId: string): Promise<any>
  cancelSubscription(subscriptionId: string): Promise<void>
}

interface CheckoutParams {
  priceId: string
  customerId?: string
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

interface CheckoutResponse {
  checkoutUrl: string
  sessionId: string
}

interface WebhookEvent {
  eventType: string
  data: any
  timestamp: string
}

interface Subscription {
  id: string
  status: string
  customerId: string
  priceId: string
  nextBilledAt?: string
  cancelledAt?: string
}

class PaddleProvider implements PaymentProvider {
  private paddle: Paddle

  constructor() {
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV === 'sandbox' 
      ? Environment.sandbox 
      : Environment.production

    this.paddle = new Paddle(process.env.PADDLE_SANDBOX_API_KEY!, {
      environment
    })
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
    try {
      const checkout = await this.paddle.transactions.create({
        items: [{ 
          priceId: params.priceId, 
          quantity: 1 
        }],
        customerEmail: params.customerEmail,
        customData: params.metadata,
        checkoutSettings: {
          successUrl: params.successUrl,
          cancelUrl: params.cancelUrl
        }
      })

      return {
        checkoutUrl: checkout.checkoutUrl || '',
        sessionId: checkout.id
      }
    } catch (error) {
      console.error('Paddle checkout creation error:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET!
      const event = this.paddle.webhooks.unmarshal(payload, secretKey, signature)
      
      return {
        eventType: event.eventType,
        data: event.data,
        timestamp: event.occurredAt
      }
    } catch (error) {
      console.error('Webhook verification error:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.paddle.subscriptions.get(subscriptionId)
      
      return {
        id: subscription.id,
        status: subscription.status,
        customerId: subscription.customerId,
        priceId: subscription.items[0]?.price?.id || '',
        nextBilledAt: subscription.nextBilledAt,
        cancelledAt: subscription.cancelledAt
      }
    } catch (error) {
      console.error('Get subscription error:', error)
      throw new Error('Failed to get subscription')
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.paddle.subscriptions.cancel(subscriptionId, {
        effectiveFrom: 'next_billing_period'
      })
    } catch (error) {
      console.error('Cancel subscription error:', error)
      throw new Error('Failed to cancel subscription')
    }
  }
}

// Export singleton instance
export const paymentProvider = new PaddleProvider()

// Export types for use in other files
export type { CheckoutParams, CheckoutResponse, WebhookEvent, Subscription }

