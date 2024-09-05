import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuestionCardProps {
  question: {
    question: string
    options: string[]
  }
  selectedAnswer: string | null
  isAnswerCorrect: boolean | null
  onAnswerSubmit: (answer: string) => void
  questionNumber: number
}

export function QuestionCard({
  question,
  selectedAnswer,
  isAnswerCorrect,
  onAnswerSubmit,
  questionNumber
}: QuestionCardProps) {
  return (
    <Card className="mb-4 p-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">{question.question}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-full min-h-[60px] p-4 flex items-center justify-between text-left transition-all duration-300 ${
                selectedAnswer === option
                  ? isAnswerCorrect
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : ''
              }`}
              onClick={() => onAnswerSubmit(option)}
              disabled={selectedAnswer !== null}
            >
              <span className="flex-grow mr-2 whitespace-normal break-words">
                {option}
              </span>
              {selectedAnswer === option && (
                <span className="flex-shrink-0">
                  {isAnswerCorrect ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
