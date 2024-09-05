import { Button } from '@/components/ui/button'

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
      <Button onClick={onStartQuiz}>Start Quiz</Button>
    </div>
  )
}
