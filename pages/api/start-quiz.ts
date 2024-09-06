import { auth } from '@/auth'
import { User } from '@/lib/models/user'

export default async function handler(req, res) {
  const session = await auth()
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await User.findById(session.user.id)
  if (user.credits < 100) {
    return res.status(400).json({ error: 'Insufficient credits' })
  }

  user.credits -= 100
  await user.save()

  // Start the quiz logic here
  // ...

  res.status(200).json({ message: 'Quiz started successfully' })
}
