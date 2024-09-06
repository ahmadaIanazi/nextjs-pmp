import { NextApiRequest, NextApiResponse } from 'next'
import { generateQuizQuestions } from '@/lib/questions/actions'

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
    externalResolver: true
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { topic, difficulty, numberOfQuestions } = req.body
      const quiz = await generateQuizQuestions(
        topic,
        difficulty,
        numberOfQuestions
      )
      res.status(200).json(quiz)
    } catch (error) {
      console.error('Error generating quiz:', error)
      res.status(500).json({ error: 'Failed to generate quiz' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
