'use client'

import { QuizCompletionModal } from '@/components/QuizCompletionModal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuiz } from '@/lib/hooks/useQuiz'
import { ChatInput } from './ChatInput'
import { ChatMessages } from './ChatMessages'
import { QuestionCard } from './QuestionCard'
import { QuizFeedback } from './QuizFeedback'
import { QuizHeader } from './QuizHeader'
import { StartScreen } from './start-screen'
import { config } from '@/config/setup'

export function Quiz() {
  const {
    aiState,
    isQuizStarted,
    score,
    level,
    experience,
    selectedAnswer,
    isAnswerCorrect,
    showFeedback,
    isLoading,
    countdown,
    showCompletionModal,
    correctAnswers,
    startQuiz,
    handleAnswerSubmit,
    handleSendMessage,
    handleRepeatQuiz,
    handleNextTopic,
    setShowCompletionModal,
    timer,
    currentTopicIndex,
    currentDifficulty
  } = useQuiz()

  if (!isQuizStarted) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <h1 className="text-6xl text-bold">Generating quiz...</h1>
        </div>
      )
    }
    if (countdown !== null) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <h1 className="text-6xl text-bold">{countdown}</h1>
        </div>
      )
    }
    return (
      <div className="flex w-full items-center justify-center h-full">
        <StartScreen onStartQuiz={startQuiz} />
      </div>
    )
  }

  const currentQuestion = aiState.questions[aiState.currentQuestionIndex]

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 space-y-4">
      <QuizHeader
        score={score}
        level={level}
        experience={experience}
        timer={timer}
      />
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <div className="flex-grow w-full overflow-auto">
          <ScrollArea className="h-full w-full">
            {currentQuestion && !showFeedback && (
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswerCorrect={isAnswerCorrect}
                onAnswerSubmit={handleAnswerSubmit}
                questionNumber={aiState.currentQuestionIndex + 1}
              />
            )}
            {showFeedback && (
              <QuizFeedback
                isCorrect={isAnswerCorrect!}
                feedbackMessage={
                  isAnswerCorrect
                    ? currentQuestion.hostMessageCorrect
                    : currentQuestion.hostMessageIncorrect
                }
              />
            )}
            <ChatMessages messages={aiState.messages} />
          </ScrollArea>
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
      <QuizCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onRepeat={handleRepeatQuiz}
        onNextTopic={handleNextTopic}
        score={score}
        totalQuestions={aiState.questions.length}
        correctAnswers={correctAnswers}
        currentTopic={config.topics[currentTopicIndex]}
        currentDifficulty={currentDifficulty}
      />
    </div>
  )
}
