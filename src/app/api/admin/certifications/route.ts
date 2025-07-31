import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCertificationStructure } from '@/lib/llm-abstraction'

// GET /api/admin/certifications - List all certifications
export async function GET(request: NextRequest) {
  try {
    const { data: certifications, error } = await supabase
      .from('certifications')
      .select(`
        *,
        content_nodes (
          id,
          name,
          description,
          node_type,
          parent_id,
          estimated_minutes,
          difficulty
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching certifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch certifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ certifications })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/certifications - Create new certification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, useAI = false } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    let certificationData: any = {
      name,
      description,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // If AI generation is requested, generate the structure
    if (useAI) {
      console.log(`[Admin API] Generating AI structure for certification: ${name}`)
      
      const aiResponse = await generateCertificationStructure(name, description)
      
      if (!aiResponse.success) {
        return NextResponse.json(
          { error: 'Failed to generate certification structure with AI', details: aiResponse.error },
          { status: 500 }
        )
      }

      try {
        const aiStructure = JSON.parse(aiResponse.content)
        certificationData.ai_generated_structure = aiStructure
        certificationData.estimated_hours = aiStructure.certification?.estimatedHours || 120
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError)
        // Continue without AI structure if parsing fails
      }
    }

    // Create certification in database
    const { data: certification, error: certError } = await supabase
      .from('certifications')
      .insert([certificationData])
      .select()
      .single()

    if (certError) {
      console.error('Error creating certification:', certError)
      return NextResponse.json(
        { error: 'Failed to create certification' },
        { status: 500 }
      )
    }

    // If AI structure was generated, create content nodes
    if (useAI && certificationData.ai_generated_structure) {
      try {
        await createContentNodesFromAI(certification.id, certificationData.ai_generated_structure)
      } catch (nodeError) {
        console.error('Error creating content nodes:', nodeError)
        // Certification is created, but nodes failed - return success with warning
      }
    }

    return NextResponse.json({ 
      certification,
      message: useAI ? 'Certification created with AI-generated structure' : 'Certification created successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to create content nodes from AI structure
async function createContentNodesFromAI(certificationId: string, aiStructure: any) {
  const certification = aiStructure.certification
  if (!certification || !certification.domains) return

  const contentNodes = []

  // Create domain nodes
  for (const domain of certification.domains) {
    const domainNode = {
      certification_id: certificationId,
      name: domain.name,
      description: domain.description,
      node_type: 'domain',
      parent_id: null,
      estimated_minutes: domain.topics?.reduce((sum: number, topic: any) => sum + (topic.estimatedMinutes || 0), 0) || 60,
      difficulty: 'intermediate',
      order_index: contentNodes.length,
      metadata: { weight: domain.weight }
    }

    const { data: domainData, error: domainError } = await supabase
      .from('content_nodes')
      .insert([domainNode])
      .select()
      .single()

    if (domainError) {
      console.error('Error creating domain node:', domainError)
      continue
    }

    // Create topic nodes under this domain
    if (domain.topics) {
      for (const topic of domain.topics) {
        const topicNode = {
          certification_id: certificationId,
          name: topic.name,
          description: topic.description,
          node_type: 'topic',
          parent_id: domainData.id,
          estimated_minutes: topic.estimatedMinutes || 45,
          difficulty: topic.difficulty || 'intermediate',
          order_index: contentNodes.length,
          metadata: { subtopics: topic.subtopics || [] }
        }

        const { error: topicError } = await supabase
          .from('content_nodes')
          .insert([topicNode])

        if (topicError) {
          console.error('Error creating topic node:', topicError)
        }
      }
    }
  }
}

// PUT /api/admin/certifications/[id] - Update certification
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Certification ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, status } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (status) updateData.status = status

    const { data: certification, error } = await supabase
      .from('certifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating certification:', error)
      return NextResponse.json(
        { error: 'Failed to update certification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ certification })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/certifications/[id] - Delete certification
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Certification ID is required' },
        { status: 400 }
      )
    }

    // Delete associated content nodes first
    await supabase
      .from('content_nodes')
      .delete()
      .eq('certification_id', id)

    // Delete certification
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting certification:', error)
      return NextResponse.json(
        { error: 'Failed to delete certification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Certification deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

