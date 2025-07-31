const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  try {
    console.log('Creating test certification...')
    
    // Create a test certification
    const { data: certification, error: certError } = await supabase
      .from('certifications')
      .insert({
        name: 'Project Management Professional (PMP)',
        description: 'Industry-standard project management certification',
        provider: 'PMI',
        difficulty: 'intermediate',
        estimated_hours: 120,
        is_active: true
      })
      .select()
      .single()

    if (certError) {
      console.error('Error creating certification:', certError)
      return
    }

    console.log('Created certification:', certification.id)

    // Create test content nodes (topics)
    const topics = [
      {
        name: 'Project Integration Management',
        description: 'Processes and activities to identify, define, combine, unify, and coordinate the various processes and project management activities',
        node_type: 'topic',
        certification_id: certification.id,
        parent_id: null,
        estimated_minutes: 45,
        difficulty: 'medium',
        order_index: 1
      },
      {
        name: 'Project Scope Management',
        description: 'Processes required to ensure that the project includes all the work required',
        node_type: 'topic',
        certification_id: certification.id,
        parent_id: null,
        estimated_minutes: 40,
        difficulty: 'medium',
        order_index: 2
      },
      {
        name: 'Project Schedule Management',
        description: 'Processes required to manage the timely completion of the project',
        node_type: 'topic',
        certification_id: certification.id,
        parent_id: null,
        estimated_minutes: 50,
        difficulty: 'hard',
        order_index: 3
      }
    ]

    console.log('Creating content nodes...')
    const { data: nodes, error: nodesError } = await supabase
      .from('content_nodes')
      .insert(topics)
      .select()

    if (nodesError) {
      console.error('Error creating content nodes:', nodesError)
      return
    }

    console.log('Created content nodes:', nodes.length)

    // Create test questions for the first topic
    const firstNode = nodes[0]
    const questions = [
      {
        node_id: firstNode.id,
        question: 'What is the primary purpose of project integration management?',
        options: [
          'To manage project scope',
          'To coordinate and unify all project management processes',
          'To manage project schedule',
          'To manage project budget'
        ],
        correct_option_index: 1,
        explanation: 'Project integration management involves coordinating and unifying all project management processes and activities to ensure project success.',
        difficulty: 'medium',
        tags: ['integration', 'fundamentals']
      },
      {
        node_id: firstNode.id,
        question: 'Which document formally authorizes the existence of a project?',
        options: [
          'Project Management Plan',
          'Project Charter',
          'Scope Statement',
          'Work Breakdown Structure'
        ],
        correct_option_index: 1,
        explanation: 'The Project Charter is the document that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
        difficulty: 'easy',
        tags: ['charter', 'authorization']
      },
      {
        node_id: firstNode.id,
        question: 'What is the purpose of the Direct and Manage Project Work process?',
        options: [
          'To monitor project performance',
          'To perform the work defined in the project management plan',
          'To control project changes',
          'To close the project'
        ],
        correct_option_index: 1,
        explanation: 'The Direct and Manage Project Work process is performed to accomplish the work defined in the project management plan to satisfy the project requirements.',
        difficulty: 'medium',
        tags: ['execution', 'management']
      }
    ]

    console.log('Creating test questions...')
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .insert(questions)
      .select()

    if (questionsError) {
      console.error('Error creating questions:', questionsError)
      return
    }

    console.log('Created questions:', questionsData.length)

    // Create test key concepts
    const keyConcepts = [
      {
        node_id: firstNode.id,
        title: 'Project Charter',
        content: 'A document issued by the project initiator or sponsor that formally authorizes the existence of a project and provides the project manager with the authority to apply organizational resources to project activities.',
        order_index: 1
      },
      {
        node_id: firstNode.id,
        title: 'Project Management Plan',
        content: 'The document that describes how the project will be executed, monitored, and controlled. It integrates and consolidates all subsidiary management plans and baselines.',
        order_index: 2
      },
      {
        node_id: firstNode.id,
        title: 'Change Control',
        content: 'A process whereby modifications to documents, deliverables, or baselines associated with the project are identified, documented, approved, or rejected.',
        order_index: 3
      }
    ]

    console.log('Creating key concepts...')
    const { data: conceptsData, error: conceptsError } = await supabase
      .from('key_concepts')
      .insert(keyConcepts)
      .select()

    if (conceptsError) {
      console.error('Error creating key concepts:', conceptsError)
      return
    }

    console.log('Created key concepts:', conceptsData.length)

    console.log('\\n✅ Test data created successfully!')
    console.log('Certification ID:', certification.id)
    console.log('First Topic ID:', firstNode.id)
    console.log('Questions created:', questionsData.length)
    console.log('Key concepts created:', conceptsData.length)

    console.log('\\nYou can now test the learning experience by navigating to:')
    console.log(`/learn/${firstNode.id}`)

  } catch (error) {
    console.error('Error creating test data:', error)
  }
}

createTestData()

