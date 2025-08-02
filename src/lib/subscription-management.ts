// Subscription Management Utilities
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface SubscriptionData {
  id: string
  user_id: string
  subscription_tier: 'free' | 'pro'
  subscription_status: 'inactive' | 'active' | 'cancelled' | 'past_due'
  subscription_id?: string
  subscription_start_date?: string
  subscription_end_date?: string
  subscription_cancelled_at?: string
}

export interface PaymentLog {
  id: string
  user_id: string
  transaction_id?: string
  amount?: number
  currency: string
  event_type: string
  event_data: any
  created_at: string
}

export interface SubscriptionLog {
  id: string
  user_id: string
  subscription_id: string
  event_type: string
  event_data: any
  created_at: string
}

/**
 * Update user subscription status in the database
 */
export async function updateUserSubscription(
  userId: string,
  subscriptionData: Partial<SubscriptionData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Subscription update error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get user subscription details
 */
export async function getUserSubscription(
  userId: string
): Promise<{ data?: SubscriptionData; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        subscription_tier,
        subscription_status,
        subscription_id,
        subscription_start_date,
        subscription_end_date,
        subscription_cancelled_at
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return { error: error.message }
    }

    return { data: { ...data, user_id: userId } }
  } catch (error) {
    console.error('Get subscription error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Log payment event
 */
export async function logPaymentEvent(
  paymentData: Omit<PaymentLog, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('payment_logs')
      .insert({
        ...paymentData,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging payment:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Payment logging error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Log subscription event
 */
export async function logSubscriptionEvent(
  subscriptionData: Omit<SubscriptionLog, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('subscription_logs')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging subscription:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Subscription logging error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get user payment history
 */
export async function getUserPaymentHistory(
  userId: string,
  limit: number = 10
): Promise<{ data?: PaymentLog[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching payment history:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Get payment history error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get user subscription history
 */
export async function getUserSubscriptionHistory(
  userId: string,
  limit: number = 10
): Promise<{ data?: SubscriptionLog[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('subscription_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching subscription history:', error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Get subscription history error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Check if user has active Pro subscription
 */
export async function hasActiveProSubscription(
  userId: string
): Promise<{ isActive: boolean; error?: string }> {
  try {
    const { data, error } = await getUserSubscription(userId)
    
    if (error) {
      return { isActive: false, error }
    }

    if (!data) {
      return { isActive: false }
    }

    // Check if user has active Pro subscription
    const isActive = data.subscription_tier === 'pro' && 
                    data.subscription_status === 'active' &&
                    (!data.subscription_end_date || 
                     new Date(data.subscription_end_date) > new Date())

    return { isActive }
  } catch (error) {
    console.error('Check subscription error:', error)
    return { 
      isActive: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Handle subscription expiration
 */
export async function handleSubscriptionExpiration(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update user to free tier
    const updateResult = await updateUserSubscription(userId, {
      subscription_tier: 'free',
      subscription_status: 'inactive'
    })

    if (!updateResult.success) {
      return updateResult
    }

    // Log the expiration event
    await logSubscriptionEvent({
      user_id: userId,
      subscription_id: 'expired',
      event_type: 'expired',
      event_data: {
        expired_at: new Date().toISOString(),
        reason: 'subscription_expired'
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Handle expiration error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

