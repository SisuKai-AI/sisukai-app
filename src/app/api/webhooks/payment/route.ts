import { NextRequest, NextResponse } from 'next/server'
import { paymentProvider } from '@/lib/payment-abstraction'
import { 
  updateUserSubscription, 
  logPaymentEvent, 
  logSubscriptionEvent 
} from '@/lib/subscription-management'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('paddle-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook
    const event = await paymentProvider.verifyWebhook(payload, signature)

    // Log webhook event
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        event_type: event.eventType,
        event_data: event.data,
        processed_at: new Date().toISOString(),
        status: 'received'
      })

    if (logError) {
      console.error('Error logging webhook:', logError)
    }

    // Process different event types
    switch (event.eventType) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data)
        break
      
      case 'transaction.completed':
        await handleTransactionCompleted(event.data)
        break
      
      case 'transaction.payment_failed':
        await handlePaymentFailed(event.data)
        break
      
      default:
        console.log(`Unhandled event type: ${event.eventType}`)
    }

    // Update webhook log status
    await supabase
      .from('webhook_logs')
      .update({ status: 'processed' })
      .eq('event_type', event.eventType)
      .eq('processed_at', new Date().toISOString())

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Log error
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: 'error',
        event_data: { error: error instanceof Error ? error.message : 'Unknown error' },
        processed_at: new Date().toISOString(),
        status: 'error'
      })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    const { customData } = data
    const userId = customData?.user_id

    if (!userId) {
      console.error('No user_id in subscription created event')
      return
    }

    // Update user to Pro tier using subscription management utility
    const updateResult = await updateUserSubscription(userId, {
      subscription_tier: 'pro',
      subscription_status: 'active',
      subscription_id: data.id,
      subscription_start_date: data.startedAt,
      subscription_end_date: data.nextBilledAt
    })

    if (!updateResult.success) {
      console.error('Error updating user subscription:', updateResult.error)
      return
    }

    // Log subscription creation
    await logSubscriptionEvent({
      user_id: userId,
      subscription_id: data.id,
      event_type: 'created',
      event_data: data
    })

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(data: any) {
  try {
    const { customData } = data
    const userId = customData?.user_id

    if (!userId) {
      console.error('No user_id in subscription updated event')
      return
    }

    // Update subscription details
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: data.status,
        subscription_end_date: data.nextBilledAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return
    }

    // Log subscription update
    await supabase
      .from('subscription_logs')
      .insert({
        user_id: userId,
        subscription_id: data.id,
        event_type: 'updated',
        event_data: data,
        created_at: new Date().toISOString()
      })

    console.log(`Subscription updated for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionCancelled(data: any) {
  try {
    const { customData } = data
    const userId = customData?.user_id

    if (!userId) {
      console.error('No user_id in subscription cancelled event')
      return
    }

    // Update user to cancelled status (but keep Pro until end date)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating cancelled subscription:', updateError)
      return
    }

    // Log subscription cancellation
    await supabase
      .from('subscription_logs')
      .insert({
        user_id: userId,
        subscription_id: data.id,
        event_type: 'cancelled',
        event_data: data,
        created_at: new Date().toISOString()
      })

    console.log(`Subscription cancelled for user ${userId}`)
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
  }
}

async function handleTransactionCompleted(data: any) {
  try {
    const { customData } = data
    const userId = customData?.user_id

    if (!userId) {
      console.error('No user_id in transaction completed event')
      return
    }

    // Log successful payment
    await supabase
      .from('payment_logs')
      .insert({
        user_id: userId,
        transaction_id: data.id,
        amount: data.details?.totals?.total || 0,
        currency: data.currencyCode || 'USD',
        event_type: 'payment_completed',
        event_data: data,
        created_at: new Date().toISOString()
      })

    console.log(`Payment completed for user ${userId}`)
  } catch (error) {
    console.error('Error handling transaction completed:', error)
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const { customData } = data
    const userId = customData?.user_id

    if (!userId) {
      console.error('No user_id in payment failed event')
      return
    }

    // Log failed payment
    await supabase
      .from('payment_logs')
      .insert({
        user_id: userId,
        transaction_id: data.id,
        event_type: 'payment_failed',
        event_data: data,
        created_at: new Date().toISOString()
      })

    console.log(`Payment failed for user ${userId}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

