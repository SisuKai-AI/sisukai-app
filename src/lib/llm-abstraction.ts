import OpenAI from 'openai'
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// LLM Provider Configuration
interface LLMProvider {
  name: string
  type: 'openai' | 'bedrock'
  client: any
  model: string
  maxTokens: number
  temperature: number
}

// DeepSeek Configuration (Primary)
const deepSeekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
})

// Amazon Bedrock Configuration (Fallback)
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'BEDROCK_ACCESS',
    secretAccessKey: process.env.BEDROCK_API_KEY || ''
  }
})

// Provider Definitions
const providers: LLMProvider[] = [
  {
    name: 'DeepSeek',
    type: 'openai',
    client: deepSeekClient,
    model: 'deepseek-chat',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    name: 'Claude-3.5-Sonnet',
    type: 'bedrock',
    client: bedrockClient,
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 4000,
    temperature: 0.7
  }
]

// Usage Statistics
interface UsageStats {
  provider: string
  requestCount: number
  tokenCount: number
  errorCount: number
  lastUsed: Date
  averageResponseTime: number
}

let usageStats: UsageStats[] = providers.map(p => ({
  provider: p.name,
  requestCount: 0,
  tokenCount: 0,
  errorCount: 0,
  lastUsed: new Date(),
  averageResponseTime: 0
}))

// LLM Request Interface
interface LLMRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  retryCount?: number
}

interface LLMResponse {
  content: string
  provider: string
  tokensUsed: number
  responseTime: number
  success: boolean
  error?: string
}

// Bedrock Helper Function
async function invokeBedrockModel(
  client: BedrockRuntimeClient,
  model: string,
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 4000,
  temperature: number = 0.7
): Promise<{ content: string; tokensUsed: number }> {
  const messages = [
    ...(systemPrompt ? [{ role: 'user', content: systemPrompt }] : []),
    { role: 'user', content: prompt }
  ]

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: maxTokens,
    temperature,
    messages
  })

  const command = new InvokeModelCommand({
    modelId: model,
    body,
    contentType: 'application/json'
  })

  const response = await client.send(command)
  const responseBody = JSON.parse(new TextDecoder().decode(response.body))
  
  return {
    content: responseBody.content[0]?.text || '',
    tokensUsed: responseBody.usage?.total_tokens || 0
  }
}

// Core LLM Abstraction Function
export async function generateContent(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now()
  let lastError: string = ''

  // Try each provider in order (Primary -> Fallback)
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const stats = usageStats.find(s => s.provider === provider.name)!

    try {
      console.log(`[LLM] Attempting ${provider.name} for content generation...`)

      let content = ''
      let tokensUsed = 0

      if (provider.type === 'openai') {
        // DeepSeek via OpenAI-compatible API
        const response = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          max_tokens: request.maxTokens || provider.maxTokens,
          temperature: request.temperature || provider.temperature
        })

        content = response.choices[0]?.message?.content || ''
        tokensUsed = response.usage?.total_tokens || 0

      } else if (provider.type === 'bedrock') {
        // Amazon Bedrock
        const result = await invokeBedrockModel(
          provider.client,
          provider.model,
          request.prompt,
          request.systemPrompt,
          request.maxTokens || provider.maxTokens,
          request.temperature || provider.temperature
        )

        content = result.content
        tokensUsed = result.tokensUsed
      }

      const responseTime = Date.now() - startTime

      // Update usage statistics
      stats.requestCount++
      stats.tokenCount += tokensUsed
      stats.lastUsed = new Date()
      stats.averageResponseTime = (stats.averageResponseTime + responseTime) / 2

      console.log(`[LLM] Success with ${provider.name}: ${tokensUsed} tokens, ${responseTime}ms`)

      return {
        content,
        provider: provider.name,
        tokensUsed,
        responseTime,
        success: true
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error'
      lastError = errorMessage
      stats.errorCount++

      console.error(`[LLM] Error with ${provider.name}:`, errorMessage)

      // If this is not the last provider, continue to fallback
      if (i < providers.length - 1) {
        console.log(`[LLM] Falling back to next provider...`)
        continue
      }
    }
  }

  // All providers failed
  const responseTime = Date.now() - startTime
  console.error(`[LLM] All providers failed. Last error: ${lastError}`)

  return {
    content: '',
    provider: 'none',
    tokensUsed: 0,
    responseTime,
    success: false,
    error: `All LLM providers failed. Last error: ${lastError}`
  }
}

// Specialized Content Generation Functions

export async function generateQuestions(topic: string, difficulty: string, count: number = 5): Promise<LLMResponse> {
  const systemPrompt = `You are an expert content creator for professional certification exams. Generate high-quality multiple-choice questions that test deep understanding and practical application.

Requirements:
- Create exactly ${count} questions
- Difficulty level: ${difficulty}
- Topic: ${topic}
- Each question should have 4 options (A, B, C, D)
- Mark the correct answer clearly
- Include brief explanations for correct answers
- Focus on real-world scenarios and practical application
- Avoid trivial or memorization-based questions

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": [
      {"text": "Option A", "isCorrect": false},
      {"text": "Option B", "isCorrect": true},
      {"text": "Option C", "isCorrect": false},
      {"text": "Option D", "isCorrect": false}
    ],
    "explanation": "Brief explanation of why the correct answer is right",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"]
  }
]`

  const prompt = `Generate ${count} professional-level multiple-choice questions about ${topic} at ${difficulty} difficulty level. Focus on practical scenarios and real-world application rather than simple memorization.`

  return await generateContent({
    prompt,
    systemPrompt,
    maxTokens: 3000,
    temperature: 0.8
  })
}

export async function generateKeyConcepts(topic: string, subtopics: string[] = []): Promise<LLMResponse> {
  const systemPrompt = `You are an expert instructional designer creating comprehensive learning materials for professional certification preparation.

Create detailed key concepts that provide:
- Clear, concise explanations
- Real-world examples and applications
- Best practices and common pitfalls
- Relationships between concepts
- Practical implementation guidance

Format your response as a JSON array with this structure:
[
  {
    "title": "Concept Title",
    "description": "Detailed explanation of the concept",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "examples": ["Example 1", "Example 2"],
    "bestPractices": ["Practice 1", "Practice 2"],
    "commonMistakes": ["Mistake 1", "Mistake 2"],
    "relatedConcepts": ["Related Concept 1", "Related Concept 2"]
  }
]`

  const subtopicText = subtopics.length > 0 ? ` Include these specific subtopics: ${subtopics.join(', ')}.` : ''
  const prompt = `Create comprehensive key concepts for ${topic}.${subtopicText} Focus on practical understanding and real-world application for professional certification preparation.`

  return await generateContent({
    prompt,
    systemPrompt,
    maxTokens: 4000,
    temperature: 0.7
  })
}

export async function generateCertificationStructure(certificationName: string, description: string): Promise<LLMResponse> {
  const systemPrompt = `You are an expert curriculum designer creating comprehensive certification structures for professional learning platforms.

Create a hierarchical learning structure with:
- Main domains/categories
- Topics within each domain
- Subtopics for detailed learning
- Logical progression and dependencies
- Estimated learning times
- Difficulty levels

Format your response as a JSON object with this structure:
{
  "certification": {
    "name": "${certificationName}",
    "description": "${description}",
    "estimatedHours": 120,
    "domains": [
      {
        "name": "Domain Name",
        "description": "Domain description",
        "weight": 25,
        "topics": [
          {
            "name": "Topic Name",
            "description": "Topic description",
            "estimatedMinutes": 45,
            "difficulty": "beginner|intermediate|advanced",
            "subtopics": ["Subtopic 1", "Subtopic 2"]
          }
        ]
      }
    ]
  }
}`

  const prompt = `Create a comprehensive learning structure for the ${certificationName} certification. ${description}

Design a curriculum that covers all essential areas with proper progression from basic to advanced concepts. Include realistic time estimates and appropriate difficulty levels.`

  return await generateContent({
    prompt,
    systemPrompt,
    maxTokens: 4000,
    temperature: 0.6
  })
}

// Usage Statistics Functions
export function getUsageStats(): UsageStats[] {
  return [...usageStats]
}

export function resetUsageStats(): void {
  usageStats = providers.map(p => ({
    provider: p.name,
    requestCount: 0,
    tokenCount: 0,
    errorCount: 0,
    lastUsed: new Date(),
    averageResponseTime: 0
  }))
}

// Health Check Function
export async function healthCheck(): Promise<{ provider: string; status: string; responseTime: number }[]> {
  const results = []

  for (const provider of providers) {
    const startTime = Date.now()
    try {
      if (provider.type === 'openai') {
        await provider.client.chat.completions.create({
          model: provider.model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      } else if (provider.type === 'bedrock') {
        await invokeBedrockModel(provider.client, provider.model, 'Hello', undefined, 10, 0.1)
      }
      
      results.push({
        provider: provider.name,
        status: 'healthy',
        responseTime: Date.now() - startTime
      })
    } catch (error) {
      results.push({
        provider: provider.name,
        status: 'error',
        responseTime: Date.now() - startTime
      })
    }
  }

  return results
}

