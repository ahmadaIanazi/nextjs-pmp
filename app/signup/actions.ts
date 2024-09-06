'use server'

import { signIn } from '@/auth'
import { ResultCode, getStringFromBuffer } from '@/lib/utils'
import { z } from 'zod'
import { kv } from '@vercel/kv'
import { getUser } from '../login/actions'
import { AuthError } from 'next-auth'

export async function createUser(
  email: string,
  hashedPassword: string,
  salt: string
) {
  const existingUser = await getUser(email)

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    }
  } else {
    const user = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      salt,
      credits: 1000,
      level: 1,
      experience: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastQuizAt: new Date().toISOString(),
      lastQuizScore: 0,
      lastQuizExperience: 0,
      lastQuizLevel: 1,
      lastQuizCredits: 1000,
      lastQuizTime: 0,
      lastQuizCorrectAnswers: 0,
      lastQuizTotalQuestions: 0,
      lastQuizAccuracy: 0,
      lastQuizSpeed: 0,
      lastQuizTopic: 0,
      lastQuizDifficulty: 0,
      lastQuizQuestions: 0,
      lastQuizAnswers: 0,
      lastQuizCorrect: 0,
      lastQuizIncorrect: 0,
      lastQuizSkipped: 0,
      quizHistory: [],
      paid: false,
      paidAt: null,
      paidUntil: null,
      paidPlan: null,
      paidPlanExpiresAt: null,
      paidPlanStartedAt: null,
      paidPlanCredits: 0,
      paidPlanExperience: 0,
      paidPlanLevel: 0,
      profile: {
        name: '',
        avatar: '',
        bio: '',
        website: '',
        location: '',
        birthday: '',
        gender: ''
      }
    }

    await kv.hmset(`user:${email}`, user)

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    }
  }
}

interface Result {
  type: string
  resultCode: ResultCode
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6)
    })
    .safeParse({
      email,
      password
    })

  if (parsedCredentials.success) {
    const salt = crypto.randomUUID()

    const encoder = new TextEncoder()
    const saltedPassword = encoder.encode(password + salt)
    const hashedPasswordBuffer = await crypto.subtle.digest(
      'SHA-256',
      saltedPassword
    )
    const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

    try {
      const result = await createUser(email, hashedPassword, salt)

      if (result.resultCode === ResultCode.UserCreated) {
        await signIn('credentials', {
          email,
          password,
          redirect: false
        })
      }

      return result
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return {
              type: 'error',
              resultCode: ResultCode.InvalidCredentials
            }
          default:
            return {
              type: 'error',
              resultCode: ResultCode.UnknownError
            }
        }
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        }
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    }
  }
}
