import { Button } from '@/components/ui/button'

export function StartScreen({ onStartQuiz }: { onStartQuiz: () => void }) {
  return (
    <div className="mx-auto  max-w-2xl px-4">
      <div className="items-center justify-center rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to the AI Trivia Challenge!
        </h1>
        <p className="mb-4 leading-normal text-muted-foreground">
          Test your knowledge with our AI-powered quiz. Are you ready to begin?
        </p>
        <Button onClick={onStartQuiz}>Start the Quiz</Button>
      </div>
    </div>
  )
}
