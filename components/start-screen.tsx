'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { Spinner } from '@/components/ui/spinner'
import { getUserCredits, getUserData } from '@/app/actions/user'
import { useState, useEffect } from 'react'

interface StartScreenProps {
  onStartQuiz: () => void
}

export function StartScreen({ onStartQuiz }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to AI Trivia Challenge
      </h1>
      <p className="text-lg mb-8">Test your knowledge and learn new facts!</p>
      <StartOrLogin onStartQuiz={onStartQuiz} />
    </div>
  )
}

function StartOrLogin({ onStartQuiz }: StartScreenProps) {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true)
      const userCredits = await getUserCredits()
      setCredits(userCredits)
      setLoading(false)
    }

    fetchUserData()
  }, [])

  if (loading) {
    return <div>Loading</div>
  }

  if (credits !== null) {
    if (credits > 100) {
      return (
        <div>
          <p>Credits: {credits}</p>
          <Button onClick={onStartQuiz}>Start Quiz</Button>
        </div>
      )
    } else {
      return (
        <div>
          <p>Credits: {credits}</p>
          <Button onClick={() => {}}>Get More Credits</Button>
        </div>
      )
    }
  } else {
    return <Button onClick={() => signIn()}>Login / Register</Button>
  }
}
