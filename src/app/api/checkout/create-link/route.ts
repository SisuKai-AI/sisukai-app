import { NextRequest, NextResponse } from 'next/server'
import { paymentProvider } from '@/lib/payment-abstraction'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CreateCheckoutRequest {
  user_id: string
  plan: 'pro_monthly' | 'pro_yearly'
  success_url?: string
  cancel_url?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json()
    const { user_id, plan, success_url, cancel_url } = body

    if (!user_id || !plan) {
      return NextResponse.json(
        { error: 'user_id and plan are required' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Define price IDs for Paddle products
    // These would be configured in your Paddle dashboard
    const priceIds = {
      pro_monthly: 'pri_01h1vjes1y163xfj1rh1tkfb65', // Replace with actual Paddle price ID
      pro_yearly: 'pri_01h1vjess2y163xfj1rh1tkfb66'   // Replace with actual Paddle price ID
    }

    const priceId = priceIds[plan]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Create checkout session
    const checkout = await paymentProvider.createCheckoutSession({
      priceId,
      customerEmail: profile.email,
      successUrl: success_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancelUrl: cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?payment=cancelled`,
      metadata: {
        user_id,
        plan,
        customer_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      }
    })

    // Log checkout creation
    const { error: logError } = await supabase
      .from('payment_logs')
      .insert({
        user_id,
        event_type: 'checkout_created',
        event_data: {
          session_id: checkout.sessionId,
          plan,
          checkout_url: checkout.checkoutUrl
        },
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging checkout creation:', logError)
    }

    return NextResponse.json({
      success: true,
      checkout_url: checkout.checkoutUrl,
      session_id: checkout.sessionId
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

