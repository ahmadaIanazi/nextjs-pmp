'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { generateQuizQuestions } from '@/lib/questions/actions'
import { Send, Star, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EmptyScreen } from './empty-screen'
import { FeedbackModal } from './feedback-modal'
import { config } from '@/config/setup'
import { nanoid } from 'nanoid'

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const [messages] = useUIState()
  const [aiState, setAIState] = useAIState()
  const { submitUserMessage } = useActions()
  const [input, setInput] = useState('')
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [difficulty, setDifficulty] = useState(1)
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [questionsBatch, setQuestionsBatch] = useState<QuizQuestion[]>([])
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)

  const startQuiz = useCallback(async () => {
    try {
      console.log('Starting quiz generation...')
      const { quizId, questions } = await generateQuizQuestions(
        config.topics[currentTopicIndex],
        difficulty,
        10
      )
      console.log('Quiz generated:', { quizId, questions })
      setQuestionsBatch(questions)
      setAIState(prevState => ({
        ...prevState,
        quizId,
        questions: questions.slice(0, 10),
        currentQuestionIndex: 0
      }))
      setIsQuizStarted(true)
      setTimer(0)
      setCorrectAnswersCount(0)
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start quiz:', error)
      toast.error('Failed to start quiz. Please try again.')
    }
  }, [setAIState, currentTopicIndex, difficulty])

  const handleAnswerSubmit = useCallback(
    async (answer: string) => {
      setSelectedAnswer(answer)
      console.log('Submitting answer:', answer)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const isCorrect = answer === currentQuestion.correctAnswer
      setIsAnswerCorrect(isCorrect)
      if (isCorrect) {
        setCorrectAnswersCount(prev => prev + 1)
      }

      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        content: answer
      }
      setChatMessages(prevMessages => [...prevMessages, userMessage])

      // Add the host message based on whether the answer is correct or not
      const hostMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: isCorrect
          ? currentQuestion.hostMessageCorrect
          : currentQuestion.hostMessageIncorrect
      }
      setChatMessages(prevMessages => [...prevMessages, hostMessage])

      await submitUserMessage(answer)

      if (aiState.currentQuestionIndex >= aiState.questions.length - 1) {
        // Stop the timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        // Check if we have completed all topics at the current difficulty level
        if (currentTopicIndex === config.topics.length - 1) {
          const nextDifficulty = difficulty + 1
          setDifficulty(nextDifficulty)
          setCurrentTopicIndex(0)
          const { questions } = await generateQuizQuestions(
            config.topics[0],
            nextDifficulty,
            10
          )
          setQuestionsBatch(questions)
          setAIState(prevState => ({
            ...prevState,
            questions: questions.slice(0, 10),
            currentQuestionIndex: 0
          }))
        } else {
          // Provide feedback and ask if the user wants to repeat the topic or move to the next one
          setFeedbackMessage(
            `Good job! You have completed Quiz ${currentTopicIndex + 1} with ${correctAnswersCount} correct out of ${aiState.questions.length} questions. Time taken: ${formatTime(timer)}. Repeat the topic or move to the next topic?`
          )
          setIsFeedbackModalOpen(true)
        }
      } else {
        setAIState(prevState => ({
          ...prevState,
          currentQuestionIndex: prevState.currentQuestionIndex + 1
        }))
      }

      setSelectedAnswer(null)
      setIsAnswerCorrect(null)
    },
    [
      submitUserMessage,
      aiState,
      setAIState,
      currentTopicIndex,
      difficulty,
      correctAnswersCount,
      timer
    ]
  )

  const handleSendMessage = useCallback(async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        content: input
      }
      setChatMessages(prevMessages => [...prevMessages, userMessage])

      console.log('Submitting user message:', input)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const messageWithContext = `Question: ${currentQuestion.question}\n\nUser's query: ${input}`
      await submitUserMessage(messageWithContext)

      // Add AI response to chatMessages (you might want to update this with the actual AI response)
      const aiResponse: Message = {
        id: nanoid(),
        role: 'assistant',
        content: 'AI response placeholder'
      }
      setChatMessages(prevMessages => [...prevMessages, aiResponse])

      setInput('')
    }
  }, [input, submitUserMessage, aiState])

  const handleRepeatTopic = useCallback(() => {
    setIsFeedbackModalOpen(false)
    setAIState(prevState => ({
      ...prevState,
      questions: questionsBatch.slice(0, 10),
      currentQuestionIndex: 0
    }))
    setCorrectAnswersCount(0)
    setTimer(0)
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1)
    }, 1000)
  }, [questionsBatch, setAIState])

  const handleNextTopic = useCallback(async () => {
    setIsFeedbackModalOpen(false)
    const nextTopicIndex = currentTopicIndex + 1
    setCurrentTopicIndex(nextTopicIndex)
    const { questions } = await generateQuizQuestions(
      config.topics[nextTopicIndex],
      difficulty,
      10
    )
    setQuestionsBatch(questions)
    setAIState(prevState => ({
      ...prevState,
      questions: questions.slice(0, 10),
      currentQuestionIndex: 0
    }))
    setCorrectAnswersCount(0)
    setTimer(0)
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1)
    }, 1000)
  }, [currentTopicIndex, difficulty, setAIState])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (experience >= level * 100) {
      setLevel(prevLevel => prevLevel + 1)
      toast.success(`Congratulations! You've reached level ${level + 1}!`)
    }
  }, [experience, level])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  if (!isQuizStarted) {
    return (
      <div className="flex w-full items-center justify-center h-full">
        <EmptyScreen onStartQuiz={startQuiz} />
      </div>
    )
  }

  const currentQuestion = aiState.questions[aiState.currentQuestionIndex]

  return (
    <div className="flex flex-col h-full max-w-4xl p-4 space-y-4">
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="font-bold">{correctAnswersCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              Question {aiState.currentQuestionIndex + 1} /{' '}
              {aiState.questions.length}
            </Badge>
            <Progress
              value={
                ((aiState.currentQuestionIndex + 1) /
                  aiState.questions.length) *
                100
              }
              className="w-20"
            />
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-1" />
            <span>{formatTime(timer)}</span>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="flex-1" ref={scrollRef}>
        {currentQuestion && (
          <Card className="mb-4 p-4">
            <CardTitle>Question {aiState.currentQuestionIndex + 1}</CardTitle>
            <CardContent>
              <h2 className="text-xl font-bold mb-4">
                {currentQuestion.question}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQuestion.options.map((option, index) => (
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
                    onClick={() => handleAnswerSubmit(option)}
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
        )}
        {chatMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-sm rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </ScrollArea>

      <Card className="mt-auto">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about the current quiz question..."
              className="flex-1 mr-2"
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onRepeat={handleRepeatTopic}
        onNext={handleNextTopic}
        feedbackMessage={feedbackMessage}
      />
    </div>
  )
}
