import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onRepeat: () => void
  onNext: () => void
  feedbackMessage: string
}

export function FeedbackModal({
  isOpen,
  onClose,
  onRepeat,
  onNext,
  feedbackMessage
}: FeedbackModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quiz Completed</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>{feedbackMessage}</p>
        </div>
        <DialogFooter>
          <Button onClick={onRepeat}>Repeat</Button>
          <Button onClick={onNext} variant="secondary">
            Next Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
