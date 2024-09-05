import { nanoid } from '@/lib/utils'
import { Quiz } from '@/components/Quiz'
import { AI } from '@/lib/chat/actions'

export const metadata = {
  title: 'AI Trivia Challenge'
}

export default async function IndexPage() {
  const id = nanoid()

  return (
    <AI
      initialAIState={{
        chatId: id,
        quizId: '',
        messages: [],
        currentQuestionIndex: 0,
        questions: [],
        topic: 'General Knowledge',
        difficulty: 1
      }}
    >
      <Quiz />
    </AI>
  )
}
