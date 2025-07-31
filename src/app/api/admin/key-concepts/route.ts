import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/key-concepts - List key concepts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('node_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('key_concepts')
      .select(`
        *,
        content_nodes (
          id,
          name,
          node_type
        )
      `)
      .order('order_index', { ascending: true })
      .range(offset, offset + limit - 1)

    if (nodeId) {
      query = query.eq('node_id', nodeId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: keyConcepts, error, count } = await query

    if (error) {
      console.error('Error fetching key concepts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch key concepts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      keyConcepts,
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

// POST /api/admin/key-concepts - Create new key concept manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      node_id,
      title,
      description,
      key_points = [],
      examples = [],
      best_practices = [],
      common_mistakes = [],
      related_concepts = [],
      metadata = {},
      order_index
    } = body

    if (!node_id || !title || !description) {
      return NextResponse.json(
        { error: 'node_id, title, and description are required' },
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
      const { data: lastConcept } = await supabase
        .from('key_concepts')
        .select('order_index')
        .eq('node_id', node_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      finalOrderIndex = (lastConcept?.order_index || 0) + 1
    }

    const conceptData = {
      node_id,
      title,
      description,
      key_points,
      examples,
      best_practices,
      common_mistakes,
      related_concepts,
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

    const { data: newConcept, error } = await supabase
      .from('key_concepts')
      .insert([conceptData])
      .select()
      .single()

    if (error) {
      console.error('Error creating key concept:', error)
      return NextResponse.json(
        { error: 'Failed to create key concept' },
        { status: 500 }
      )
    }

    return NextResponse.json({ keyConcept: newConcept })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/key-concepts/[id] - Update key concept
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Key concept ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      key_points,
      examples,
      best_practices,
      common_mistakes,
      related_concepts,
      status,
      order_index,
      metadata
    } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (key_points) updateData.key_points = key_points
    if (examples) updateData.examples = examples
    if (best_practices) updateData.best_practices = best_practices
    if (common_mistakes) updateData.common_mistakes = common_mistakes
    if (related_concepts) updateData.related_concepts = related_concepts
    if (status) updateData.status = status
    if (order_index !== undefined) updateData.order_index = order_index
    if (metadata) updateData.metadata = metadata

    const { data: updatedConcept, error } = await supabase
      .from('key_concepts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating key concept:', error)
      return NextResponse.json(
        { error: 'Failed to update key concept' },
        { status: 500 }
      )
    }

    return NextResponse.json({ keyConcept: updatedConcept })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/key-concepts/[id] - Delete key concept
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Key concept ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('key_concepts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting key concept:', error)
      return NextResponse.json(
        { error: 'Failed to delete key concept' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Key concept deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

