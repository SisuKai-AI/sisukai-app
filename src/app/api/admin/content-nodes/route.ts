import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admin/content-nodes - List content nodes with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const certificationId = searchParams.get('certification_id')
    const nodeType = searchParams.get('node_type')
    const parentId = searchParams.get('parent_id')

    let query = supabase
      .from('content_nodes')
      .select('*')
      .order('order_index', { ascending: true })

    if (certificationId) {
      query = query.eq('certification_id', certificationId)
    }

    if (nodeType) {
      query = query.eq('node_type', nodeType)
    }

    if (parentId) {
      query = query.eq('parent_id', parentId)
    }

    const { data: contentNodes, error } = await query

    if (error) {
      console.error('Error fetching content nodes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch content nodes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contentNodes })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/content-nodes - Create new content node
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      certification_id,
      name,
      description,
      node_type,
      parent_id = null,
      estimated_minutes = 45,
      difficulty = 'intermediate',
      order_index,
      metadata = {}
    } = body

    if (!certification_id || !name || !node_type) {
      return NextResponse.json(
        { error: 'certification_id, name, and node_type are required' },
        { status: 400 }
      )
    }

    // Validate node_type
    const validNodeTypes = ['domain', 'topic', 'subtopic', 'lesson']
    if (!validNodeTypes.includes(node_type)) {
      return NextResponse.json(
        { error: 'Invalid node_type. Must be one of: domain, topic, subtopic, lesson' },
        { status: 400 }
      )
    }

    // If order_index not provided, get the next available index
    let finalOrderIndex = order_index
    if (finalOrderIndex === undefined) {
      const { data: lastNode } = await supabase
        .from('content_nodes')
        .select('order_index')
        .eq('certification_id', certification_id)
        .eq('parent_id', parent_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      finalOrderIndex = (lastNode?.order_index || 0) + 1
    }

    const contentNodeData = {
      certification_id,
      name,
      description,
      node_type,
      parent_id,
      estimated_minutes,
      difficulty,
      order_index: finalOrderIndex,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: contentNode, error } = await supabase
      .from('content_nodes')
      .insert([contentNodeData])
      .select()
      .single()

    if (error) {
      console.error('Error creating content node:', error)
      return NextResponse.json(
        { error: 'Failed to create content node' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contentNode })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/content-nodes/[id] - Update content node
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content node ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      estimated_minutes,
      difficulty,
      order_index,
      metadata
    } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (estimated_minutes !== undefined) updateData.estimated_minutes = estimated_minutes
    if (difficulty) updateData.difficulty = difficulty
    if (order_index !== undefined) updateData.order_index = order_index
    if (metadata) updateData.metadata = metadata

    const { data: contentNode, error } = await supabase
      .from('content_nodes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating content node:', error)
      return NextResponse.json(
        { error: 'Failed to update content node' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contentNode })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/content-nodes/[id] - Delete content node
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content node ID is required' },
        { status: 400 }
      )
    }

    // Delete child nodes first (cascade delete)
    await supabase
      .from('content_nodes')
      .delete()
      .eq('parent_id', id)

    // Delete associated questions and key concepts
    await supabase
      .from('questions')
      .delete()
      .eq('node_id', id)

    await supabase
      .from('key_concepts')
      .delete()
      .eq('node_id', id)

    // Delete the content node
    const { error } = await supabase
      .from('content_nodes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting content node:', error)
      return NextResponse.json(
        { error: 'Failed to delete content node' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Content node deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

