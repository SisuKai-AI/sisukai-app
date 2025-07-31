import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/questions - List questions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('node_id')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('questions')
      .select(`
        *,
        content_nodes (
          id,
          name,
          node_type
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (nodeId) {
      query = query.eq('node_id', nodeId)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: questions, error, count } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      questions,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/questions - Create new question manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      node_id,
      question,
      options,
      explanation = '',
      difficulty = 'intermediate',
      tags = [],
      metadata = {},
      order_index
    } = body

    if (!node_id || !question || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: 'node_id, question, and options array are required' },
        { status: 400 }
      )
    }

    // Validate options structure
    if (options.length !== 4) {
      return NextResponse.json(
        { error: 'Exactly 4 options are required' },
        { status: 400 }
      )
    }

    const correctOptions = options.filter((opt: any) => opt.isCorrect)
    if (correctOptions.length !== 1) {
      return NextResponse.json(
        { error: 'Exactly one option must be marked as correct' },
        { status: 400 }
      )
    }

    // Verify content node exists
    const { data: contentNode, error: nodeError } = await supabase
      .from('content_nodes')
      .select('id')
      .eq('id', node_id)
      .single()

    if (nodeError || !contentNode) {
      return NextResponse.json(
        { error: 'Content node not found' },
        { status: 404 }
      )
    }

    // Get next order index if not provided
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined) {
      const { data: lastQuestion } = await supabase
        .from('questions')
        .select('order_index')
        .eq('node_id', node_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      finalOrderIndex = (lastQuestion?.order_index || 0) + 1
    }

    const questionData = {
      node_id,
      question,
      options,
      explanation,
      difficulty,
      tags,
      metadata: {
        ...metadata,
        ai_generated: false,
        manual_creation: true
      },
      order_index: finalOrderIndex,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newQuestion, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ question: newQuestion })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/questions/[id] - Update question
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      question,
      options,
      explanation,
      difficulty,
      tags,
      status,
      order_index,
      metadata
    } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (question) updateData.question = question
    if (options) {
      // Validate options if provided
      if (!Array.isArray(options) || options.length !== 4) {
        return NextResponse.json(
          { error: 'Options must be an array of exactly 4 items' },
          { status: 400 }
        )
      }

      const correctOptions = options.filter((opt: any) => opt.isCorrect)
      if (correctOptions.length !== 1) {
        return NextResponse.json(
          { error: 'Exactly one option must be marked as correct' },
          { status: 400 }
        )
      }

      updateData.options = options
    }
    if (explanation !== undefined) updateData.explanation = explanation
    if (difficulty) updateData.difficulty = difficulty
    if (tags) updateData.tags = tags
    if (status) updateData.status = status
    if (order_index !== undefined) updateData.order_index = order_index
    if (metadata) updateData.metadata = metadata

    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ question: updatedQuestion })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/questions/[id] - Delete question
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Question deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

