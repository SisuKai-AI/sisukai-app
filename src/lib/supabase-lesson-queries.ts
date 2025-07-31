import { supabase } from './supabase'

export interface Question {
  id: string
  node_id: string
  question: string
  options: string[]
  correct_option_index: number
  explanation: string
  difficulty: string
  tags: string[]
  created_at: string
}

export interface KeyConcept {
  id: string
  node_id: string
  title: string
  content: string
  order_index: number
  created_at: string
}

export interface ContentNode {
  id: string
  name: string
  description: string
  node_type: string
  certification_id: string
  parent_id: string | null
  estimated_minutes: number
  difficulty: string
  order_index: number
}

export interface UserMastery {
  id: string
  user_id: string
  node_id: string
  mastery_level: number
  total_attempts: number
  correct_attempts: number
  last_practiced: string
  created_at: string
  updated_at: string
}

export async function getLessonQuestions(nodeId: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching questions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching questions:', error)
    return []
  }
}

export async function getLessonKeyConcepts(nodeId: string): Promise<KeyConcept[]> {
  try {
    const { data, error } = await supabase
      .from('key_concepts')
      .select('*')
      .eq('node_id', nodeId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching key concepts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching key concepts:', error)
    return []
  }
}

export async function getContentNode(nodeId: string): Promise<ContentNode | null> {
  try {
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
  } catch (error) {
    console.error('Unexpected error fetching content node:', error)
    return null
  }
}

export async function getUserMastery(userId: string, nodeId: string): Promise<UserMastery | null> {
  try {
    const { data, error } = await supabase
      .from('user_mastery')
      .select('*')
      .eq('user_id', userId)
      .eq('node_id', nodeId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user mastery:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Unexpected error fetching user mastery:', error)
    return null
  }
}

export async function createOrUpdateUserMastery(
  userId: string,
  nodeId: string,
  masteryLevel: number,
  totalAttempts: number,
  correctAttempts: number
): Promise<UserMastery | null> {
  try {
    const { data, error } = await supabase
      .from('user_mastery')
      .upsert({
        user_id: userId,
        node_id: nodeId,
        mastery_level: masteryLevel,
        total_attempts: totalAttempts,
        correct_attempts: correctAttempts,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating user mastery:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error updating user mastery:', error)
    return null
  }
}

