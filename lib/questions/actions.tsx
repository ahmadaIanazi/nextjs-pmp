'use server'
import { nanoid } from '@/lib/utils'
import OpenAI from 'openai'

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateQuizQuestions(
  topic: string,
  numberOfQuestions: number
) {
  console.log('Generating quiz questions:', { topic, numberOfQuestions })
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator. Create a quiz about ${topic} with ${numberOfQuestions} questions. Each question should have 4 options and only one correct answer.`
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
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctAnswer: { type: 'string' }
                  },
                  required: ['question', 'options', 'correctAnswer']
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
