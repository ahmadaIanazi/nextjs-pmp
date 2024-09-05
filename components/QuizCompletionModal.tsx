import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface QuizCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onRepeat: () => void
  onNextTopic: () => void
  score: number
  totalQuestions: number
  correctAnswers: number
  currentTopic: string
  currentDifficulty: number
}

export function QuizCompletionModal({
  isOpen,
  onClose,
  onRepeat,
  onNextTopic,
  score,
  totalQuestions,
  correctAnswers,
  currentTopic,
  currentDifficulty
}: QuizCompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quiz Completed</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Your score: {score}</p>
          <p>
            Correct answers: {correctAnswers} out of {totalQuestions}
          </p>
          <p>Current Topic: {currentTopic}</p>
          <p>Difficulty Level: {currentDifficulty}</p>
        </div>
        <DialogFooter>
          <Button onClick={onRepeat}>Repeat</Button>
          <Button onClick={onNextTopic} variant="secondary">
            Next Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
