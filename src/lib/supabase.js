import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  return data
}

// Helper function to get user learning path
export const getUserLearningPath = async (userId) => {
  const { data, error } = await supabase
    .from('user_learning_paths')
    .select(`
      *,
      content_nodes (
        id,
        name,
        description,
        estimated_minutes,
        node_type
      )
    `)
    .eq('user_id', userId)
    .order('order_index')
  
  if (error) {
    console.error('Error getting user learning path:', error)
    return []
  }
  return data
}

// Helper function to get user mastery data
export const getUserMastery = async (userId) => {
  const { data, error } = await supabase
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error getting user mastery:', error)
    return []
  }
  return data
}

