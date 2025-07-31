import { supabase } from './supabase'

// User Profile Functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  return data
}

export async function createUserProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }
  return data
}

// Learning Path Functions
export async function getUserLearningPath(userId: string) {
  const { data, error } = await supabase
    .from('user_learning_paths')
    .select(`
      *,
      content_nodes (
        id,
        name,
        description,
        estimated_minutes,
        node_type,
        parent_id
      )
    `)
    .eq('user_id', userId)
    .order('order_index')
  
  if (error) {
    console.error('Error fetching user learning path:', error)
    return []
  }
  return data
}

export async function getAdaptiveLearningPath(userId: string) {
  // Get user's mastery data
  const { data: masteryData, error: masteryError } = await supabase
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId)
  
  if (masteryError) {
    console.error('Error fetching mastery data:', masteryError)
    return []
  }

  // Get available content nodes
  const { data: contentNodes, error: contentError } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('node_type', 'topic')
    .order('name')
  
  if (contentError) {
    console.error('Error fetching content nodes:', contentError)
    return []
  }

  // Combine mastery data with content nodes
  const combinedData = contentNodes.map(node => {
    const mastery = masteryData.find(m => m.node_id === node.id)
    return {
      ...node,
      masteryLevel: mastery ? mastery.mastery_level : 0.0,
      lastAttempted: mastery ? mastery.last_attempted : null
    }
  })

  // Sort by mastery level (adaptive learning - lowest first)
  return combinedData.sort((a, b) => a.masteryLevel - b.masteryLevel)
}

// User Mastery Functions
export async function getUserMastery(userId: string) {
  const { data, error } = await supabase
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user mastery:', error)
    return []
  }
  return data
}

export async function updateUserMastery(userId: string, nodeId: string, masteryLevel: number) {
  const { data, error } = await supabase
    .from('user_mastery')
    .upsert([
      {
        user_id: userId,
        node_id: nodeId,
        mastery_level: masteryLevel,
        last_attempted: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user mastery:', error)
    return null
  }
  return data
}

// Gamification Functions
export async function getUserGamification(userId: string) {
  const { data, error } = await supabase
    .from('user_gamification')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user gamification:', error)
    return null
  }
  return data
}

export async function updateUserGamification(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('user_gamification')
    .upsert([
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user gamification:', error)
    return null
  }
  return data
}

// Content Functions
export async function getContentNode(nodeId: string) {
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('id', nodeId)
    .single()
  
  if (error) {
    console.error('Error fetching content node:', error)
    return null
  }
  return data
}

export async function getQuestionsByNode(nodeId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('node_id', nodeId)
    .order('created_at')
  
  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }
  return data
}

