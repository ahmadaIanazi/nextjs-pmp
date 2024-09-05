import { Card, CardContent } from '@/components/ui/card'

interface QuizFeedbackProps {
  isCorrect: boolean
  feedbackMessage: string
}

export function QuizFeedback({
  isCorrect,
  feedbackMessage
}: QuizFeedbackProps) {
  return (
    <Card className="mb-4 p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h2>
        <p>{feedbackMessage}</p>
      </CardContent>
    </Card>
  )
}
