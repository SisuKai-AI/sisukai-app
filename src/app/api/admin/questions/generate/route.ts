import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateQuestions } from '@/lib/llm-abstraction'

// POST /api/admin/questions/generate - Generate questions using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      node_id,
      topic,
      difficulty = 'intermediate',
      count = 5,
      save_to_database = false
    } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required for question generation' },
        { status: 400 }
      )
    }

    // Validate difficulty level
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level. Must be: beginner, intermediate, or advanced' },
        { status: 400 }
      )
    }

    // Validate count
    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      )
    }

    console.log(`[Questions API] Generating ${count} ${difficulty} questions for topic: ${topic}`)

    // Generate questions using AI
    const aiResponse = await generateQuestions(topic, difficulty, count)

    if (!aiResponse.success) {
      console.error('[Questions API] AI generation failed:', aiResponse.error)
      return NextResponse.json(
        { 
          error: 'Failed to generate questions with AI',
          details: aiResponse.error,
          provider: aiResponse.provider
        },
        { status: 500 }
      )
    }

    // Parse AI response
    let generatedQuestions
    try {
      generatedQuestions = JSON.parse(aiResponse.content)
      
      if (!Array.isArray(generatedQuestions)) {
        throw new Error('AI response is not an array')
      }
    } catch (parseError) {
      console.error('[Questions API] Error parsing AI response:', parseError)
      return NextResponse.json(
        { 
          error: 'Failed to parse AI-generated questions',
          rawResponse: aiResponse.content.substring(0, 500) + '...'
        },
        { status: 500 }
      )
    }

    // Validate question structure
    const validatedQuestions = generatedQuestions.map((q, index) => {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        throw new Error(`Invalid question structure at index ${index}`)
      }

      // Ensure exactly one correct answer
      const correctOptions = q.options.filter((opt: any) => opt.isCorrect)
      if (correctOptions.length !== 1) {
        throw new Error(`Question ${index + 1} must have exactly one correct answer`)
      }

      return {
        question: q.question,
        options: q.options,
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        tags: q.tags || [topic.toLowerCase()],
        metadata: {
          ai_generated: true,
          ai_provider: aiResponse.provider,
          generation_timestamp: new Date().toISOString()
        }
      }
    })

    console.log(`[Questions API] Successfully generated ${validatedQuestions.length} questions`)

    // Save to database if requested
    let savedQuestions = null
    if (save_to_database && node_id) {
      try {
        // Verify the content node exists
        const { data: contentNode, error: nodeError } = await supabase
          .from('content_nodes')
          .select('id, name')
          .eq('id', node_id)
          .single()

        if (nodeError || !contentNode) {
          return NextResponse.json(
            { error: 'Content node not found' },
            { status: 404 }
          )
        }

        // Prepare questions for database insertion
        const questionsToInsert = validatedQuestions.map((q, index) => ({
          node_id,
          question: q.question,
          options: q.options,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags,
          metadata: q.metadata,
          order_index: index,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        // Insert questions into database
        const { data: insertedQuestions, error: insertError } = await supabase
          .from('questions')
          .insert(questionsToInsert)
          .select()

        if (insertError) {
          console.error('[Questions API] Error saving questions:', insertError)
          return NextResponse.json(
            { 
              error: 'Failed to save questions to database',
              questions: validatedQuestions,
              details: insertError.message
            },
            { status: 500 }
          )
        }

        savedQuestions = insertedQuestions
        console.log(`[Questions API] Saved ${savedQuestions.length} questions to database`)
      } catch (saveError) {
        console.error('[Questions API] Error during save process:', saveError)
        return NextResponse.json(
          { 
            error: 'Error occurred while saving questions',
            questions: validatedQuestions
          },
          { status: 500 }
        )
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      questions: savedQuestions || validatedQuestions,
      metadata: {
        topic,
        difficulty,
        count: validatedQuestions.length,
        ai_provider: aiResponse.provider,
        tokens_used: aiResponse.tokensUsed,
        response_time: aiResponse.responseTime,
        saved_to_database: !!savedQuestions
      }
    })

  } catch (error) {
    console.error('[Questions API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

