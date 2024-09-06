'use server'

import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { User } from '@/lib/types'

/**
 * Fetches the user's credits from the database.
 * @returns {Promise<number | null>} The user's credits or null if not found.
 */
export async function getUserCredits(): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await kv.hgetall<User>(`user:${session.user.email}`)
  return user?.credits ?? null
}

/**
 * Fetches the user's data from the database.
 * @returns {Promise<Partial<User> | null>} Partial user data or null if not found.
 */
export async function getUserData(): Promise<Partial<User> | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await kv.hgetall<User>(`user:${session.user.email}`)
  if (!user) return null

  // Return only safe-to-expose user data
  return {
    id: user.id,
    email: user.email,
    credits: user.credits,
    level: user.level,
    experience: user.experience,
    profile: user.profile
  }
}

/**
 * Updates the user's credits in the database.
 * @param {number} amount - The amount to add (positive) or subtract (negative) from the user's credits.
 * @returns {Promise<number | null>} The updated credit balance or null if the operation failed.
 */
export async function updateUserCredits(
  amount: number
): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const userKey = `user:${session.user.email}`
  const currentCredits = (await kv.hget<number>(userKey, 'credits')) ?? 0
  const newCredits = Math.max(0, currentCredits + amount) // Ensure credits don't go below 0

  await kv.hset(userKey, { credits: newCredits })
  return newCredits
}
