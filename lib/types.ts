import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
}

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  messages: Message[]
  path: string
  currentQuestionIndex: number
  quizId: string
  questions: QuizQuestion[]
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User {
  id: string
  email: string
  password: string // Note: This should be hashed
  salt: string
  credits: number
  level: number
  experience: number
  createdAt: string
  updatedAt: string
  lastLoginAt: string
  profile: {
    name: string
    avatar: string
    bio: string
  }
}

export interface QuizQuestion {
  difficulty: number
  topic: string
  question: string
  options: string[]
  correctAnswer: string
  hostMessageCorrect: string
  hostMessageIncorrect: string
}
