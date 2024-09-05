'use server'

import OpenAI from 'openai'
import { z } from 'zod'
import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState
} from 'ai/rsc'
import { nanoid } from '@/lib/utils'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import { saveChat } from '@/app/actions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const QuizQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  hostMessageCorrect: z.string(),
  hostMessageIncorrect: z.string()
})

type QuizQuestion = z.infer<typeof QuizQuestion>

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  const { quizId, currentQuestionIndex, questions } = aiState.get()

  console.log('Submitting user message:', {
    content,
    quizId,
    currentQuestionIndex
  })

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    console.error('No current question found:', {
      currentQuestionIndex,
      questions
    })
    throw new Error('No current question found')
  }

  const isAnswer = currentQuestion.options.includes(content)

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI quiz assistant. Provide explanations and feedback for quiz questions.'
        },
        {
          role: 'user',
          content: isAnswer
            ? `Question: ${currentQuestion.question}\nUser's answer: ${content}\nCorrect answer: ${currentQuestion.correctAnswer}`
            : `Current question: ${currentQuestion.question}\nUser's query: ${content}`
        }
      ],
      stream: true
    })

    console.log('OpenAI response received', response)

    let assistantResponse = ''

    for await (const chunk of response) {
      assistantResponse += chunk.choices[0]?.delta?.content || ''
    }

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'assistant',
          content: assistantResponse
        }
      ],
      currentQuestionIndex: isAnswer
        ? currentQuestionIndex + 1
        : currentQuestionIndex
    })

    console.log('AI state updated:', aiState.get())

    return {
      id: nanoid(),
      role: 'assistant',
      content: assistantResponse
    }
  } catch (error) {
    console.error('Error in submitUserMessage:', error)
    throw error
  }
}

export type AIState = {
  chatId: string
  quizId: string
  messages: Message[]
  currentQuestionIndex: number
  questions: QuizQuestion[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: {
    chatId: nanoid(),
    quizId: '',
    messages: [],
    currentQuestionIndex: 0,
    questions: []
  },
  onGetUIState: async () => {
    'use server'
    const session = await auth()
    if (session?.user) {
      const aiState = getAIState() as Chat
      if (aiState) {
        return getUIStateFromAIState(aiState)
      }
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'
    const session = await auth()
    if (session?.user) {
      const { chatId, messages, currentQuestionIndex, quizId, questions } =
        state
      const chat: Chat = {
        id: chatId,
        title: `Quiz ${quizId}`,
        userId: session.user.id,
        createdAt: new Date(),
        messages,
        path: `/chat/${chatId}`,
        currentQuestionIndex,
        quizId,
        questions
      }
      await saveChat(chat)
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      role: message.role,
      content: message.content
    }))
}
