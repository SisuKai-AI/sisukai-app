import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  calculateNewMasteryLevel, 
  calculateXPEarned,
  updateMasteryData,
  needsSpacedRepetition,
  calculateTopicPriority,
  getMasteryDescription
} from '@/lib/mastery-calculation'

interface UpdateMasteryRequest {
  user_id: string
  node_id: string
  question_attempts: Array<{
    question_id: string
    is_correct: boolean
    difficulty: 'easy' | 'medium' | 'hard'
    time_spent?: number
  }>
}

interface GetMasteryRequest {
  user_id: string
  node_id?: string
  certification_id?: string
}

// GET: Retrieve user mastery data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const node_id = searchParams.get('node_id')
    const certification_id = searchParams.get('certification_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    if (node_id) {
      // Get mastery for specific node
      const { data: mastery, error } = await supabase
        .from('user_mastery')
        .select(`
          *,
          content_nodes (
            name,
            description,
            difficulty,
            estimated_minutes
          )
        `)
        .eq('user_id', user_id)
        .eq('node_id', node_id)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to fetch mastery data' },
          { status: 500 }
        )
      }

      if (!mastery) {
        // Return default mastery data if none exists
        return NextResponse.json({
          mastery_level: 0.0,
          total_attempts: 0,
          correct_attempts: 0,
          needs_practice: true,
          priority_score: 1.0,
          description: getMasteryDescription(0.0)
        })
      }

      const needsPractice = needsSpacedRepetition(
        mastery.mastery_level,
        new Date(mastery.last_practiced),
        mastery.total_attempts
      )

      const priority = calculateTopicPriority(
        mastery.mastery_level,
        new Date(mastery.last_practiced),
        mastery.total_attempts
      )

      return NextResponse.json({
        ...mastery,
        needs_practice: needsPractice,
        priority_score: priority,
        description: getMasteryDescription(mastery.mastery_level)
      })

    } else if (certification_id) {
      // Get mastery for all nodes in certification
      const { data: masteryData, error } = await supabase
        .from('user_mastery')
        .select(`
          *,
          content_nodes!inner (
            name,
            description,
            difficulty,
            estimated_minutes,
            certification_id
          )
        `)
        .eq('user_id', user_id)
        .eq('content_nodes.certification_id', certification_id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch mastery data' },
          { status: 500 }
        )
      }

      // Calculate overall certification mastery
      const totalMastery = masteryData.reduce((sum, item) => sum + item.mastery_level, 0)
      const averageMastery = masteryData.length > 0 ? totalMastery / masteryData.length : 0

      // Add calculated fields to each item
      const enrichedData = masteryData.map(item => ({
        ...item,
        needs_practice: needsSpacedRepetition(
          item.mastery_level,
          new Date(item.last_practiced),
          item.total_attempts
        ),
        priority_score: calculateTopicPriority(
          item.mastery_level,
          new Date(item.last_practiced),
          item.total_attempts
        ),
        description: getMasteryDescription(item.mastery_level)
      }))

      return NextResponse.json({
        certification_mastery: averageMastery,
        total_nodes: masteryData.length,
        mastery_data: enrichedData
      })

    } else {
      // Get all mastery data for user
      const { data: masteryData, error } = await supabase
        .from('user_mastery')
        .select(`
          *,
          content_nodes (
            name,
            description,
            difficulty,
            estimated_minutes,
            certification_id
          )
        `)
        .eq('user_id', user_id)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch mastery data' },
          { status: 500 }
        )
      }

      // Enrich with calculated fields
      const enrichedData = masteryData.map(item => ({
        ...item,
        needs_practice: needsSpacedRepetition(
          item.mastery_level,
          new Date(item.last_practiced),
          item.total_attempts
        ),
        priority_score: calculateTopicPriority(
          item.mastery_level,
          new Date(item.last_practiced),
          item.total_attempts
        ),
        description: getMasteryDescription(item.mastery_level)
      }))

      return NextResponse.json({
        total_nodes: masteryData.length,
        mastery_data: enrichedData
      })
    }

  } catch (error) {
    console.error('Error in mastery GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Update mastery based on question attempts
export async function POST(request: NextRequest) {
  try {
    const body: UpdateMasteryRequest = await request.json()
    const { user_id, node_id, question_attempts } = body

    if (!user_id || !node_id || !question_attempts || question_attempts.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current mastery data
    const { data: currentMastery, error: masteryError } = await supabase
      .from('user_mastery')
      .select('*')
      .eq('user_id', user_id)
      .eq('node_id', node_id)
      .single()

    // Initialize mastery data if it doesn't exist
    let masteryData = {
      masteryLevel: 0.0,
      totalAttempts: 0,
      correctAttempts: 0,
      consecutiveCorrect: 0,
      lastPracticed: new Date()
    }

    if (currentMastery && !masteryError) {
      masteryData = {
        masteryLevel: currentMastery.mastery_level,
        totalAttempts: currentMastery.total_attempts,
        correctAttempts: currentMastery.correct_attempts,
        consecutiveCorrect: 0, // Reset for new session
        lastPracticed: new Date(currentMastery.last_practiced)
      }
    }

    // Process each question attempt
    let totalXPEarned = 0
    let consecutiveCorrect = 0

    for (const attempt of question_attempts) {
      // Update consecutive correct count
      if (attempt.is_correct) {
        consecutiveCorrect += 1
      } else {
        consecutiveCorrect = 0
      }

      // Update mastery data
      masteryData = updateMasteryData(masteryData, {
        isCorrect: attempt.is_correct,
        difficulty: attempt.difficulty,
        timeSpent: attempt.time_spent,
        timestamp: new Date()
      })

      // Calculate XP for this attempt
      const xp = calculateXPEarned(
        attempt.is_correct,
        attempt.difficulty,
        masteryData.masteryLevel,
        attempt.time_spent
      )
      totalXPEarned += xp

      // Record individual attempt
      await supabase
        .from('user_question_attempts')
        .insert({
          user_id,
          question_id: attempt.question_id,
          node_id,
          selected_option: null, // Would need to be passed from frontend
          is_correct: attempt.is_correct,
          time_taken: attempt.time_spent,
          created_at: new Date().toISOString()
        })
    }

    // Update mastery in database
    const { data: updatedMastery, error: updateError } = await supabase
      .from('user_mastery')
      .upsert({
        user_id,
        node_id,
        mastery_level: masteryData.masteryLevel,
        total_attempts: masteryData.totalAttempts,
        correct_attempts: masteryData.correctAttempts,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating mastery:', updateError)
      return NextResponse.json(
        { error: 'Failed to update mastery' },
        { status: 500 }
      )
    }

    // Update user's total XP
    if (totalXPEarned > 0) {
      await supabase.rpc('increment_user_xp', {
        user_id_param: user_id,
        xp_amount: totalXPEarned
      })
    }

    // Calculate additional metrics
    const needsPractice = needsSpacedRepetition(
      masteryData.masteryLevel,
      masteryData.lastPracticed,
      masteryData.totalAttempts
    )

    const priority = calculateTopicPriority(
      masteryData.masteryLevel,
      masteryData.lastPracticed,
      masteryData.totalAttempts
    )

    return NextResponse.json({
      mastery_level: masteryData.masteryLevel,
      total_attempts: masteryData.totalAttempts,
      correct_attempts: masteryData.correctAttempts,
      xp_earned: totalXPEarned,
      needs_practice: needsPractice,
      priority_score: priority,
      description: getMasteryDescription(masteryData.masteryLevel),
      consecutive_correct: consecutiveCorrect
    })

  } catch (error) {
    console.error('Error in mastery POST API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

