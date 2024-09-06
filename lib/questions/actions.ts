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
          content: `Create a concise quiz about ${topic} with ${numberOfQuestions} questions. Each question should have 4 options, one correct answer, and brief feedback messages.`
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
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctAnswer: { type: 'string' },
                    hostMessageCorrect: { type: 'string' },
                    hostMessageIncorrect: { type: 'string' }
                  },
                  required: [
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

// Fallback questions in case the API fails
const fallbackQuestions = [
  {
    difficulty: 1,
    topic: 'General Knowledge',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    hostMessageCorrect: 'Correct! Paris is indeed the capital of France.',
    hostMessageIncorrect:
      "Sorry, that's incorrect. The capital of France is Paris."
  }
  // Add more fallback questions here...
]

export function getFallbackQuestions(count: number) {
  return {
    quizId: 'fallback-quiz',
    questions: fallbackQuestions.slice(0, count)
  }
}
