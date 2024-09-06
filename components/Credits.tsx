'use client'
import { getUserCredits } from '@/app/actions/user'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'

export default function UserCredits() {
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

  return (
    <div className="flex items-center">
      <Badge variant="secondary">Credits {credits}</Badge>
    </div>
  )
}
