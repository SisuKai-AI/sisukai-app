// Mock data for SisuKai eLearning Platform

// --- MOCK USERS ---
export const mockUsers = {
  'user-free-1': {
    id: 'user-free-1',
    email: 'free.user@example.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    tier: 'free',
    subscription_status: 'inactive',
    gamification: { 
      xp: 150, 
      current_streak: 3, 
      longest_streak: 5,
      level: 1,
      achievements: ['first_lesson', 'three_day_streak']
    },
    created_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-30T14:30:00Z'
  },
  'user-pro-1': {
    id: 'user-pro-1',
    email: 'pro.user@example.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    tier: 'pro',
    subscription_status: 'active',
    gamification: { 
      xp: 1250, 
      current_streak: 14, 
      longest_streak: 20,
      level: 3,
      achievements: ['first_lesson', 'three_day_streak', 'week_warrior', 'knowledge_seeker']
    },
    created_at: '2023-11-20T09:15:00Z',
    last_login: '2024-01-30T16:45:00Z'
  },
  'admin-1': {
    id: 'admin-1',
    email: 'admin@sisukai.com',
    firstName: 'Jordan',
    lastName: 'Smith',
    tier: 'admin',
    subscription_status: 'active',
    role: 'administrator',
    gamification: { 
      xp: 2500, 
      current_streak: 30, 
      longest_streak: 45,
      level: 5,
      achievements: ['first_lesson', 'three_day_streak', 'week_warrior', 'knowledge_seeker', 'master_learner']
    },
    created_at: '2023-06-01T08:00:00Z',
    last_login: '2024-01-30T17:00:00Z'
  }
};

// --- MOCK CERTIFICATIONS (ContentNodes) ---
export const mockCertifications = [
  {
    nodeId: 'cert-pmp-1',
    nodeType: 'certification',
    nodeName: 'Project Management Professional (PMP)',
    description: 'Master the art and science of project management with the globally recognized PMP certification. Learn essential skills in project planning, execution, monitoring, and closure.',
    metadata: { 
      difficulty: 'intermediate', 
      issuingBody: 'PMI',
      duration: '6-8 months',
      examFormat: '180 questions, 240 minutes',
      passingScore: '61%',
      category: 'Project Management',
      tags: ['leadership', 'planning', 'agile', 'risk-management']
    },
    enrollmentCount: 1234,
    rating: 4.7,
    isPopular: true,
    isNew: false,
    imageUrl: '/images/pmp-cert.jpg'
  },
  {
    nodeId: 'cert-cissp-1',
    nodeType: 'certification',
    nodeName: 'Certified Information Systems Security Professional (CISSP)',
    description: 'Advance your cybersecurity career with the CISSP certification. Demonstrate your expertise in designing, implementing, and managing cybersecurity programs.',
    metadata: { 
      difficulty: 'advanced', 
      issuingBody: 'ISC2',
      duration: '8-12 months',
      examFormat: '100-150 questions, 3 hours',
      passingScore: '700/1000',
      category: 'Cybersecurity',
      tags: ['security', 'risk-assessment', 'compliance', 'governance']
    },
    enrollmentCount: 892,
    rating: 4.8,
    isPopular: true,
    isNew: false,
    imageUrl: '/images/cissp-cert.jpg'
  },
  {
    nodeId: 'cert-aws-saa-1',
    nodeType: 'certification',
    nodeName: 'AWS Solutions Architect Associate',
    description: 'Design and deploy scalable, highly available systems on AWS. Learn cloud architecture best practices and AWS services.',
    metadata: { 
      difficulty: 'intermediate', 
      issuingBody: 'Amazon Web Services',
      duration: '4-6 months',
      examFormat: '65 questions, 130 minutes',
      passingScore: '720/1000',
      category: 'Cloud Computing',
      tags: ['aws', 'cloud-architecture', 'scalability', 'devops']
    },
    enrollmentCount: 2156,
    rating: 4.6,
    isPopular: false,
    isNew: true,
    imageUrl: '/images/aws-saa-cert.jpg'
  },
  {
    nodeId: 'cert-scrum-master-1',
    nodeType: 'certification',
    nodeName: 'Certified ScrumMaster (CSM)',
    description: 'Learn to facilitate Scrum teams and drive agile transformation. Master the principles and practices of Scrum methodology.',
    metadata: { 
      difficulty: 'beginner', 
      issuingBody: 'Scrum Alliance',
      duration: '2-3 months',
      examFormat: '50 questions, 60 minutes',
      passingScore: '74%',
      category: 'Agile & Scrum',
      tags: ['scrum', 'agile', 'facilitation', 'team-leadership']
    },
    enrollmentCount: 1567,
    rating: 4.5,
    isPopular: false,
    isNew: true,
    imageUrl: '/images/csm-cert.jpg'
  }
];

// --- MOCK LEARNING PATH (ContentNodes & UserMastery) ---
export const mockLearningPaths = {
  'user-pro-1': {
    'cert-pmp-1': [
      { 
        nodeId: 'topic-risk-1', 
        nodeName: 'Risk Management', 
        masteryLevel: 0.2, 
        parentName: 'Planning',
        description: 'Learn to identify, analyze, and respond to project risks',
        estimatedTime: '45 min',
        questionCount: 12,
        lastStudied: '2024-01-28T10:00:00Z'
      },
      { 
        nodeId: 'topic-scope-1', 
        nodeName: 'Scope Management', 
        masteryLevel: 0.4, 
        parentName: 'Planning',
        description: 'Master project scope definition and control',
        estimatedTime: '35 min',
        questionCount: 10,
        lastStudied: '2024-01-29T14:30:00Z'
      },
      { 
        nodeId: 'topic-agile-1', 
        nodeName: 'Agile Methodologies', 
        masteryLevel: 0.8, 
        parentName: 'Execution',
        description: 'Understand agile principles and practices',
        estimatedTime: '50 min',
        questionCount: 15,
        lastStudied: '2024-01-30T09:15:00Z'
      },
      { 
        nodeId: 'topic-stakeholder-1', 
        nodeName: 'Stakeholder Management', 
        masteryLevel: 0.6, 
        parentName: 'Execution',
        description: 'Learn to identify and engage project stakeholders',
        estimatedTime: '40 min',
        questionCount: 11,
        lastStudied: '2024-01-27T16:20:00Z'
      },
      { 
        nodeId: 'topic-quality-1', 
        nodeName: 'Quality Management', 
        masteryLevel: 0.3, 
        parentName: 'Monitoring',
        description: 'Ensure project deliverables meet quality standards',
        estimatedTime: '30 min',
        questionCount: 8,
        lastStudied: null
      }
    ]
  },
  'user-free-1': {
    'cert-pmp-1': [
      { 
        nodeId: 'topic-scope-1', 
        nodeName: 'Scope Management', 
        masteryLevel: 0.4, 
        parentName: 'Planning',
        description: 'Master project scope definition and control',
        estimatedTime: '35 min',
        questionCount: 10,
        lastStudied: '2024-01-29T14:30:00Z'
      },
      { 
        nodeId: 'topic-agile-1', 
        nodeName: 'Agile Methodologies', 
        masteryLevel: 0.8, 
        parentName: 'Execution',
        description: 'Understand agile principles and practices',
        estimatedTime: '50 min',
        questionCount: 15,
        lastStudied: '2024-01-30T09:15:00Z'
      },
      { 
        nodeId: 'topic-risk-1', 
        nodeName: 'Risk Management', 
        masteryLevel: 0.2, 
        parentName: 'Planning',
        description: 'Learn to identify, analyze, and respond to project risks',
        estimatedTime: '45 min',
        questionCount: 12,
        lastStudied: '2024-01-28T10:00:00Z'
      }
    ]
  }
};

// --- MOCK LESSON CONTENT (Questions & KeyConcepts) ---
export const mockLessons = {
  'topic-risk-1': {
    questions: [
      {
        questionId: 'q-risk-1',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is the primary purpose of a risk register?',
          options: [
            'To eliminate all risks from the project',
            'To document and track identified risks throughout the project',
            'To transfer all risks to a third party',
            'To calculate the total project budget including contingencies'
          ],
          correctOptionIndex: 1
        },
        explanation: 'A risk register is a living document used to identify, analyze, and manage risks throughout the project lifecycle. It serves as a central repository for all risk-related information.',
        difficulty: 'medium',
        tags: ['risk-register', 'documentation']
      },
      {
        questionId: 'q-risk-2',
        questionType: 'mcq',
        questionData: {
          questionText: 'Which of the following is NOT a risk response strategy?',
          options: [
            'Avoid',
            'Mitigate',
            'Accept',
            'Ignore'
          ],
          correctOptionIndex: 3
        },
        explanation: 'The four main risk response strategies are: Avoid (eliminate the risk), Mitigate (reduce probability or impact), Transfer (shift risk to third party), and Accept (acknowledge and monitor). "Ignore" is not a valid risk response strategy.',
        difficulty: 'easy',
        tags: ['risk-response', 'strategies']
      },
      {
        questionId: 'q-risk-3',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is the difference between qualitative and quantitative risk analysis?',
          options: [
            'Qualitative uses numbers, quantitative uses descriptions',
            'Qualitative prioritizes risks, quantitative measures probability and impact numerically',
            'There is no difference between them',
            'Qualitative is done first, quantitative is never needed'
          ],
          correctOptionIndex: 1
        },
        explanation: 'Qualitative risk analysis prioritizes risks based on their probability and impact using descriptive scales (high, medium, low). Quantitative risk analysis uses numerical techniques to measure the probability and impact of risks.',
        difficulty: 'medium',
        tags: ['qualitative-analysis', 'quantitative-analysis']
      },
      {
        questionId: 'q-risk-4',
        questionType: 'mcq',
        questionData: {
          questionText: 'When should risk identification be performed?',
          options: [
            'Only at the beginning of the project',
            'Only when problems occur',
            'Throughout the entire project lifecycle',
            'Only during the planning phase'
          ],
          correctOptionIndex: 2
        },
        explanation: 'Risk identification should be performed throughout the entire project lifecycle. New risks can emerge at any time, and existing risks may change in probability or impact as the project progresses.',
        difficulty: 'easy',
        tags: ['risk-identification', 'project-lifecycle']
      },
      {
        questionId: 'q-risk-5',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is a risk trigger?',
          options: [
            'An event that causes a risk to occur',
            'A warning sign that a risk event may be about to occur',
            'The person responsible for managing a risk',
            'The cost associated with a risk event'
          ],
          correctOptionIndex: 1
        },
        explanation: 'A risk trigger is a warning sign or symptom that indicates a risk event may be about to occur. Triggers help project managers take proactive action before the risk actually materializes.',
        difficulty: 'medium',
        tags: ['risk-triggers', 'early-warning']
      }
    ],
    keyConcepts: [
      { 
        conceptId: 'kc-risk-1', 
        conceptTitle: 'Risk Register', 
        conceptBody: 'A risk register is a comprehensive document that captures all identified risks in a project. It typically includes risk descriptions, probability assessments, impact evaluations, risk owners, response strategies, and current status. The risk register is a living document that should be updated regularly throughout the project lifecycle.'
      },
      { 
        conceptId: 'kc-risk-2', 
        conceptTitle: 'Qualitative vs. Quantitative Analysis', 
        conceptBody: 'Qualitative risk analysis prioritizes risks based on their probability of occurrence and impact on project objectives using descriptive scales. Quantitative risk analysis uses numerical techniques to analyze the effect of identified risks on overall project objectives and provides numerical estimates of risk exposure.'
      },
      { 
        conceptId: 'kc-risk-3', 
        conceptTitle: 'Risk Response Strategies', 
        conceptBody: 'There are four main strategies for responding to negative risks: Avoid (eliminate the risk), Mitigate (reduce probability or impact), Transfer (shift risk to third party), and Accept (acknowledge and monitor). For positive risks (opportunities), the strategies are: Exploit, Enhance, Share, and Accept.'
      },
      { 
        conceptId: 'kc-risk-4', 
        conceptTitle: 'Risk Triggers and Early Warning Signs', 
        conceptBody: 'Risk triggers are warning signs or symptoms that indicate a risk event may be about to occur. They help project managers implement contingency plans before risks materialize. Examples include missed milestones, budget overruns, or key team member absences.'
      }
    ]
  },
  'topic-scope-1': {
    questions: [
      {
        questionId: 'q-scope-1',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is the primary purpose of a Work Breakdown Structure (WBS)?',
          options: [
            'To assign resources to project tasks',
            'To decompose project work into manageable components',
            'To create the project schedule',
            'To estimate project costs'
          ],
          correctOptionIndex: 1
        },
        explanation: 'The Work Breakdown Structure (WBS) is a hierarchical decomposition of the total scope of work to be carried out by the project team. It breaks down the project into smaller, more manageable components.',
        difficulty: 'easy',
        tags: ['wbs', 'scope-decomposition']
      },
      {
        questionId: 'q-scope-2',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is scope creep?',
          options: [
            'The natural evolution of project requirements',
            'Uncontrolled expansion of project scope without adjustments to time, cost, and resources',
            'The process of defining project boundaries',
            'A technique for managing stakeholder expectations'
          ],
          correctOptionIndex: 1
        },
        explanation: 'Scope creep refers to the uncontrolled expansion or addition of features, functions, or requirements to a project without corresponding adjustments to time, cost, and resources. It can lead to project delays and budget overruns.',
        difficulty: 'medium',
        tags: ['scope-creep', 'change-control']
      }
    ],
    keyConcepts: [
      { 
        conceptId: 'kc-scope-1', 
        conceptTitle: 'Work Breakdown Structure (WBS)', 
        conceptBody: 'The WBS is a hierarchical decomposition of the total scope of work to be carried out by the project team to accomplish the project objectives and create the required deliverables. It organizes and defines the total scope of the project.'
      },
      { 
        conceptId: 'kc-scope-2', 
        conceptTitle: 'Scope Creep Management', 
        conceptBody: 'Scope creep is the uncontrolled expansion of project scope. It can be managed through proper change control processes, clear requirements documentation, stakeholder engagement, and regular scope validation.'
      }
    ]
  },
  'topic-agile-1': {
    questions: [
      {
        questionId: 'q-agile-1',
        questionType: 'mcq',
        questionData: {
          questionText: 'What is the recommended length for a Sprint in Scrum?',
          options: [
            '1 week',
            '2-4 weeks',
            '6-8 weeks',
            'As long as needed to complete all features'
          ],
          correctOptionIndex: 1
        },
        explanation: 'Sprints in Scrum are typically 2-4 weeks long, with many teams finding 2 weeks to be optimal. The length should be consistent throughout the project to establish a predictable rhythm.',
        difficulty: 'easy',
        tags: ['scrum', 'sprint-length']
      }
    ],
    keyConcepts: [
      { 
        conceptId: 'kc-agile-1', 
        conceptTitle: 'Agile Manifesto', 
        conceptBody: 'The Agile Manifesto values individuals and interactions over processes and tools, working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a plan.'
      }
    ]
  }
};

// --- MOCK EXAM DATA ---
export const mockExams = {
  'cert-pmp-1': {
    full_sim: { 
      questionCount: 180, 
      timeLimit: 240, // minutes
      description: 'Complete PMP simulation exam with 180 questions',
      passingScore: 61
    },
    domain_specific: [
      { 
        domainId: 'domain-planning-1', 
        domainName: 'Planning', 
        questionCount: 40,
        timeLimit: 60,
        description: 'Focus on project planning processes and techniques'
      },
      { 
        domainId: 'domain-execution-1', 
        domainName: 'Execution', 
        questionCount: 50,
        timeLimit: 75,
        description: 'Focus on project execution and team management'
      },
      { 
        domainId: 'domain-monitoring-1', 
        domainName: 'Monitoring & Controlling', 
        questionCount: 45,
        timeLimit: 70,
        description: 'Focus on project monitoring and control processes'
      }
    ],
    quick_quiz: {
      questionCount: 20,
      timeLimit: 30,
      description: 'Quick assessment of your current knowledge'
    }
  }
};

// --- MOCK ADMIN DATA ---
export const mockFeedbackQueue = [
  {
    feedbackId: 'fb-1',
    questionId: 'q-risk-1',
    questionText: 'What is the primary purpose of a risk register?',
    feedbackReasons: ['unclear', 'wrong_answer'],
    userComment: 'The explanation is confusing and doesn\'t clearly explain why option B is correct.',
    status: 'open',
    submittedBy: 'user-pro-1',
    submittedAt: '2024-01-29T10:30:00Z',
    priority: 'medium'
  },
  {
    feedbackId: 'fb-2',
    questionId: 'q-scope-2',
    questionText: 'What is scope creep?',
    feedbackReasons: ['outdated'],
    userComment: 'This question seems outdated. Modern agile practices handle scope changes differently.',
    status: 'open',
    submittedBy: 'user-free-1',
    submittedAt: '2024-01-28T14:15:00Z',
    priority: 'low'
  },
  {
    feedbackId: 'fb-3',
    questionId: 'q-agile-1',
    questionText: 'What is the recommended length for a Sprint in Scrum?',
    feedbackReasons: ['wrong_answer', 'unclear'],
    userComment: 'The correct answer should be more flexible. Many teams use 1-week sprints successfully.',
    status: 'open',
    submittedBy: 'user-pro-1',
    submittedAt: '2024-01-30T09:45:00Z',
    priority: 'high'
  },
  {
    feedbackId: 'fb-4',
    questionId: 'q-risk-3',
    questionText: 'What is the difference between qualitative and quantitative risk analysis?',
    feedbackReasons: ['typo'],
    userComment: 'There\'s a typo in option C - "them" should be "the two approaches".',
    status: 'open',
    submittedBy: 'user-free-1',
    submittedAt: '2024-01-27T16:20:00Z',
    priority: 'low'
  }
];

// --- MOCK ANALYTICS DATA ---
export const mockAnalytics = {
  platformStats: {
    totalUsers: 15420,
    activeUsers: 8934,
    totalCertifications: 4,
    totalQuestions: 1250,
    averageCompletionRate: 78.5
  },
  userProgress: {
    'user-pro-1': {
      totalStudyTime: 2340, // minutes
      questionsAnswered: 156,
      averageAccuracy: 82.3,
      topicsCompleted: 8,
      certificationsInProgress: 1
    },
    'user-free-1': {
      totalStudyTime: 420, // minutes
      questionsAnswered: 45,
      averageAccuracy: 76.8,
      topicsCompleted: 2,
      certificationsInProgress: 1
    }
  }
};

// --- MOCK ACHIEVEMENTS ---
export const mockAchievements = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    rarity: 'common'
  },
  {
    id: 'three_day_streak',
    name: 'Consistency',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    rarity: 'uncommon'
  },
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Answer 100 questions correctly',
    icon: '🧠',
    rarity: 'rare'
  },
  {
    id: 'master_learner',
    name: 'Master Learner',
    description: 'Achieve 90% mastery in 5 topics',
    icon: '👑',
    rarity: 'legendary'
  }
];

// --- HELPER FUNCTIONS ---
export const getCurrentUser = () => {
  // This will be replaced by actual auth context
  return mockUsers['user-pro-1'];
};

export const getUserLearningPath = (userId, certificationId) => {
  return mockLearningPaths[userId]?.[certificationId] || [];
};

export const getLessonContent = (topicId) => {
  return mockLessons[topicId] || { questions: [], keyConcepts: [] };
};

export const getCertificationById = (certId) => {
  return mockCertifications.find(cert => cert.nodeId === certId);
};

export const getFilteredCertifications = (filters = {}) => {
  let filtered = [...mockCertifications];
  
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(cert => 
      cert.metadata.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  if (filters.difficulty && filters.difficulty !== 'all') {
    filtered = filtered.filter(cert => 
      cert.metadata.difficulty === filters.difficulty
    );
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(cert => 
      cert.nodeName.toLowerCase().includes(searchTerm) ||
      cert.description.toLowerCase().includes(searchTerm) ||
      cert.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sort
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.nodeName.localeCompare(b.nodeName));
        break;
      default:
        break;
    }
  }
  
  return filtered;
};

