import { useState, useCallback, useEffect } from 'react'
import { useAIState, useActions } from 'ai/rsc'
import { toast } from 'sonner'
import { generateQuizQuestions } from '@/lib/questions/actions'
import { nanoid } from '@/lib/utils'
import { Message } from '@/lib/types'
import { config } from '@/config/setup'

export function useQuiz() {
  const [aiState, setAIState] = useAIState()
  const { submitUserMessage } = useActions()
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timer, setTimer] = useState(0)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState(1)

  const startQuiz = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: config.topics[currentTopicIndex],
          difficulty: currentDifficulty,
          numberOfQuestions: 10
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const result = await response.json()

      if (
        !result ||
        typeof result !== 'object' ||
        !('quizId' in result) ||
        !('questions' in result) ||
        !Array.isArray(result.questions) ||
        result.questions.length === 0
      ) {
        throw new Error(`Invalid quiz data: ${JSON.stringify(result)}`)
      }

      const { quizId, questions } = result

      setAIState(prevState => ({
        ...prevState,
        quizId,
        questions,
        currentQuestionIndex: 0
      }))
      setIsLoading(false)
      setCountdown(3)
      setTimer(0)
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval)
            setIsQuizStarted(true)
            return null
          }
          return prev! - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to start quiz:', error)
      toast.error(`Failed to start quiz: ${error.message}. Please try again.`)
      setIsLoading(false)
    }
  }, [setAIState, currentTopicIndex, currentDifficulty])

  // Add this effect to handle the timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isQuizStarted && !showCompletionModal) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isQuizStarted, showCompletionModal])

  const handleAnswerSubmit = useCallback(
    async (answer: string) => {
      setSelectedAnswer(answer)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const isCorrect = answer === currentQuestion.correctAnswer
      setIsAnswerCorrect(isCorrect)
      const pointsEarned = isCorrect ? 10 : 0

      setScore(prevScore => prevScore + pointsEarned)
      setExperience(prevExp => prevExp + pointsEarned)

      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1)
      }

      setShowFeedback(true)

      const hostMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: isCorrect
          ? currentQuestion.hostMessageCorrect
          : currentQuestion.hostMessageIncorrect
      }
      setAIState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, hostMessage]
      }))

      setTimeout(() => {
        setShowFeedback(false)
        if (aiState.currentQuestionIndex < aiState.questions.length - 1) {
          setAIState(prevState => ({
            ...prevState,
            currentQuestionIndex: prevState.currentQuestionIndex + 1
          }))
        } else {
          setShowCompletionModal(true)
        }
        setSelectedAnswer(null)
        setIsAnswerCorrect(null)
      }, 1000)
    },
    [aiState, setAIState]
  )

  const handleSendMessage = useCallback(
    async (input: string) => {
      if (input.trim()) {
        const userMessage: Message = {
          id: nanoid(),
          role: 'user',
          content: input
        }
        setAIState(prevState => ({
          ...prevState,
          messages: [...prevState.messages, userMessage]
        }))

        const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
        const messageWithContext = `The user is asking about this question: "${currentQuestion.question}"\n\nUser's query: ${input}`
        const response = await submitUserMessage(messageWithContext)
        setAIState(prevState => ({
          ...prevState,
          messages: [...prevState.messages, response]
        }))
      }
    },
    [aiState, submitUserMessage, setAIState]
  )

  const handleRepeatQuiz = useCallback(() => {
    setShowCompletionModal(false)
    setScore(0)
    setCorrectAnswers(0)
    setTimer(0) // Reset timer when repeating the quiz
    setAIState(prevState => ({
      ...prevState,
      currentQuestionIndex: 0
    }))
  }, [setAIState])

  useEffect(() => {
    if (experience >= level * 100) {
      setLevel(prevLevel => prevLevel + 1)
      toast.success(`Congratulations! You've reached level ${level + 1}!`)
    }
  }, [experience, level])

  const handleNextTopic = useCallback(async () => {
    let nextTopicIndex = currentTopicIndex + 1
    let nextDifficulty = currentDifficulty

    if (nextTopicIndex >= config.topics.length) {
      nextTopicIndex = 0
      nextDifficulty += 1
      toast.success(
        `Congratulations! You've moved to difficulty level ${nextDifficulty}!`
      )
    }

    setCurrentTopicIndex(nextTopicIndex)
    setCurrentDifficulty(nextDifficulty)
    setShowCompletionModal(false)
    setScore(0)
    setCorrectAnswers(0)
    setTimer(0)

    // Start a new quiz with the next topic or difficulty
    setIsLoading(true)
    try {
      const { quizId, questions } = await generateQuizQuestions(
        config.topics[nextTopicIndex],
        nextDifficulty,
        10
      )
      setAIState(prevState => ({
        ...prevState,
        quizId,
        questions,
        currentQuestionIndex: 0,
        difficulty: nextDifficulty,
        messages: [] // Clear previous messages
      }))
      setIsLoading(false)
      setCountdown(3)
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(countdownInterval)
            setIsQuizStarted(true)
            return null
          }
          return prev! - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to start next quiz:', error)
      toast.error('Failed to start next quiz. Please try again.')
      setIsLoading(false)
    }
  }, [currentTopicIndex, currentDifficulty, setAIState])

  return {
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
    timer,
    startQuiz,
    handleAnswerSubmit,
    handleSendMessage,
    handleRepeatQuiz,
    setShowCompletionModal,
    handleNextTopic,
    currentTopicIndex,
    currentDifficulty
  }
}
