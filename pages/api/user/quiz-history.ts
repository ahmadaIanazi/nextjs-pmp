import { auth } from '@/auth'
import { User } from '@/lib/models/user'

export default async function handler(req, res) {
  const session = await auth()
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await User.findById(session.user.id).populate('quizHistory')
  res.status(200).json({ quizHistory: user.quizHistory })
}
