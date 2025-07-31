import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateKeyConcepts } from '@/lib/llm-abstraction'

// POST /api/admin/key-concepts/generate - Generate key concepts using AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      node_id,
      topic,
      subtopics = [],
      save_to_database = false
    } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required for key concept generation' },
        { status: 400 }
      )
    }

    console.log(`[Key Concepts API] Generating key concepts for topic: ${topic}`)
    if (subtopics.length > 0) {
      console.log(`[Key Concepts API] Including subtopics: ${subtopics.join(', ')}`)
    }

    // Generate key concepts using AI
    const aiResponse = await generateKeyConcepts(topic, subtopics)

    if (!aiResponse.success) {
      console.error('[Key Concepts API] AI generation failed:', aiResponse.error)
      return NextResponse.json(
        { 
          error: 'Failed to generate key concepts with AI',
          details: aiResponse.error,
          provider: aiResponse.provider
        },
        { status: 500 }
      )
    }

    // Parse AI response
    let generatedConcepts
    try {
      generatedConcepts = JSON.parse(aiResponse.content)
      
      if (!Array.isArray(generatedConcepts)) {
        throw new Error('AI response is not an array')
      }
    } catch (parseError) {
      console.error('[Key Concepts API] Error parsing AI response:', parseError)
      return NextResponse.json(
        { 
          error: 'Failed to parse AI-generated key concepts',
          rawResponse: aiResponse.content.substring(0, 500) + '...'
        },
        { status: 500 }
      )
    }

    // Validate and structure key concepts
    const validatedConcepts = generatedConcepts.map((concept, index) => {
      if (!concept.title || !concept.description) {
        throw new Error(`Invalid concept structure at index ${index}`)
      }

      return {
        title: concept.title,
        description: concept.description,
        key_points: concept.keyPoints || concept.key_points || [],
        examples: concept.examples || [],
        best_practices: concept.bestPractices || concept.best_practices || [],
        common_mistakes: concept.commonMistakes || concept.common_mistakes || [],
        related_concepts: concept.relatedConcepts || concept.related_concepts || [],
        metadata: {
          ai_generated: true,
          ai_provider: aiResponse.provider,
          generation_timestamp: new Date().toISOString(),
          topic,
          subtopics
        }
      }
    })

    console.log(`[Key Concepts API] Successfully generated ${validatedConcepts.length} key concepts`)

    // Save to database if requested
    let savedConcepts = null
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

        // Prepare key concepts for database insertion
        const conceptsToInsert = validatedConcepts.map((concept, index) => ({
          node_id,
          title: concept.title,
          description: concept.description,
          key_points: concept.key_points,
          examples: concept.examples,
          best_practices: concept.best_practices,
          common_mistakes: concept.common_mistakes,
          related_concepts: concept.related_concepts,
          metadata: concept.metadata,
          order_index: index,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        // Insert key concepts into database
        const { data: insertedConcepts, error: insertError } = await supabase
          .from('key_concepts')
          .insert(conceptsToInsert)
          .select()

        if (insertError) {
          console.error('[Key Concepts API] Error saving concepts:', insertError)
          return NextResponse.json(
            { 
              error: 'Failed to save key concepts to database',
              concepts: validatedConcepts,
              details: insertError.message
            },
            { status: 500 }
          )
        }

        savedConcepts = insertedConcepts
        console.log(`[Key Concepts API] Saved ${savedConcepts.length} key concepts to database`)
      } catch (saveError) {
        console.error('[Key Concepts API] Error during save process:', saveError)
        return NextResponse.json(
          { 
            error: 'Error occurred while saving key concepts',
            concepts: validatedConcepts
          },
          { status: 500 }
        )
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      concepts: savedConcepts || validatedConcepts,
      metadata: {
        topic,
        subtopics,
        count: validatedConcepts.length,
        ai_provider: aiResponse.provider,
        tokens_used: aiResponse.tokensUsed,
        response_time: aiResponse.responseTime,
        saved_to_database: !!savedConcepts
      }
    })

  } catch (error) {
    console.error('[Key Concepts API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

