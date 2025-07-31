import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface SubmitAnswerRequest {
  user_id: string
  question_id: string
  node_id: string
  selected_option: number
  question_index: number
  total_questions: number
}

// Mastery calculation logic (from unit tests)
function calculateNewMasteryLevel(
  currentMastery: number,
  isCorrect: boolean,
  difficulty: string,
  consecutiveCorrect: number
): number {
  const difficultyMultiplier = {
    'easy': 1.0,
    'medium': 1.2,
    'hard': 1.5
  }[difficulty] || 1.0

  if (isCorrect) {
    // Increase mastery for correct answers
    const baseIncrease = 0.1 * difficultyMultiplier
    const streakBonus = Math.min(consecutiveCorrect * 0.02, 0.1)
    const increase = baseIncrease + streakBonus
    
    return Math.min(currentMastery + increase, 1.0)
  } else {
    // Decrease mastery for incorrect answers
    const decrease = 0.05 * difficultyMultiplier
    return Math.max(currentMastery - decrease, 0.0)
  }
}

// XP calculation based on difficulty and performance
function calculateXPEarned(isCorrect: boolean, difficulty: string, masteryLevel: number): number {
  if (!isCorrect) return 0

  const baseXP = {
    'easy': 10,
    'medium': 15,
    'hard': 25
  }[difficulty] || 10

  // Bonus XP for high mastery (mastery above 0.8 gets bonus)
  const masteryBonus = masteryLevel > 0.8 ? Math.floor(baseXP * 0.5) : 0
  
  return baseXP + masteryBonus
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await request.json()
    const { user_id, question_id, node_id, selected_option, question_index, total_questions } = body

    // Validate required fields
    if (!user_id || !question_id || !node_id || selected_option === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the question from database
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const isCorrect = selected_option === question.correct_option_index

    // Get current user mastery for this node
    const { data: currentMastery, error: masteryError } = await supabase
      .from('user_mastery')
      .select('*')
      .eq('user_id', user_id)
      .eq('node_id', node_id)
      .single()

    // Initialize mastery data if it doesn't exist
    let masteryLevel = 0.0
    let totalAttempts = 0
    let correctAttempts = 0
    let consecutiveCorrect = 0

    if (currentMastery && !masteryError) {
      masteryLevel = currentMastery.mastery_level
      totalAttempts = currentMastery.total_attempts
      correctAttempts = currentMastery.correct_attempts
      
      // Calculate consecutive correct (simplified - in real implementation, 
      // this would track the actual sequence)
      consecutiveCorrect = isCorrect ? 1 : 0
    }

    // Update attempt counts
    totalAttempts += 1
    if (isCorrect) {
      correctAttempts += 1
    }

    // Calculate new mastery level
    const newMasteryLevel = calculateNewMasteryLevel(
      masteryLevel,
      isCorrect,
      question.difficulty,
      consecutiveCorrect
    )

    // Calculate XP earned
    const xpEarned = calculateXPEarned(isCorrect, question.difficulty, newMasteryLevel)

    // Update user mastery in database
    const { error: updateError } = await supabase
      .from('user_mastery')
      .upsert({
        user_id,
        node_id,
        mastery_level: newMasteryLevel,
        total_attempts: totalAttempts,
        correct_attempts: correctAttempts,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('Error updating user mastery:', updateError)
      return NextResponse.json(
        { error: 'Failed to update mastery' },
        { status: 500 }
      )
    }

    // Record the answer attempt
    const { error: attemptError } = await supabase
      .from('user_question_attempts')
      .insert({
        user_id,
        question_id,
        node_id,
        selected_option,
        is_correct: isCorrect,
        time_taken: null, // Could be tracked from frontend
        created_at: new Date().toISOString()
      })

    if (attemptError) {
      console.error('Error recording attempt:', attemptError)
      // Don't fail the request for this, just log it
    }

    // Update user's total XP (if user_profiles table exists)
    if (xpEarned > 0) {
      const { error: xpError } = await supabase.rpc('increment_user_xp', {
        user_id_param: user_id,
        xp_amount: xpEarned
      })

      if (xpError) {
        console.error('Error updating user XP:', xpError)
        // Don't fail the request for this
      }
    }

    // Return result
    return NextResponse.json({
      is_correct: isCorrect,
      correct_option: question.correct_option_index,
      explanation: question.explanation,
      xp_earned: xpEarned,
      new_mastery_level: newMasteryLevel,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      progress: {
        current_question: question_index + 1,
        total_questions,
        percentage: ((question_index + 1) / total_questions) * 100
      }
    })

  } catch (error) {
    console.error('Error in submit-answer API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

