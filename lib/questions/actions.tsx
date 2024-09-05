'use server'
import { config } from '@/config/setup'
import { nanoid } from '@/lib/utils'
import OpenAI from 'openai'

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateQuizQuestions(
  topic: string,
  difficulty: number,
  numberOfQuestions: number
) {
  console.log('Generating quiz questions:', {
    topic,
    difficulty,
    numberOfQuestions
  })
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator for ${config.sitename}. 
          You are helping the user to prepare for ${config.AISubject}.
          Using the following documentation: ${config.AIDocs}. And Starting with the basics, and increasing the difficulty as the user progresses.
          Create a quiz about ${topic} with ${numberOfQuestions} questions. Each question should have 4 options and only one correct answer. Also a host message to the user if they answer a question correctly or incorrectly.`
        },
        {
          role: 'user',
          content: 'Generate the quiz questions.'
        }
      ],
      functions: [
        {
          name: 'createQuiz',
          parameters: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    difficulty: { type: 'number' },
                    topic: { type: 'string' },
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctAnswer: { type: 'string' },
                    hostMessageCorrect: { type: 'string' },
                    hostMessageIncorrect: { type: 'string' }
                  },
                  required: [
                    'difficulty',
                    'topic',
                    'question',
                    'options',
                    'correctAnswer',
                    'hostMessageCorrect',
                    'hostMessageIncorrect'
                  ]
                }
              }
            },
            required: ['questions']
          }
        }
      ],
      function_call: { name: 'createQuiz' }
    })

    console.log('OpenAI response:', response)

    const functionCall = response.choices[0].message.function_call
    if (functionCall && functionCall.name === 'createQuiz') {
      const quizData = JSON.parse(functionCall.arguments)
      console.log('Generated quiz data:', quizData)
      return {
        quizId: nanoid(),
        questions: quizData.questions
      }
    }

    throw new Error('Failed to generate quiz questions')
  } catch (error) {
    console.error('Error generating quiz questions:', error)
    throw error
  }
}

// Remove the AIState and UIState types from this file as they're defined in lib/chat/actions.tsx
