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
import {
  Send,
  Star,
  Coffee,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EmptyScreen } from './empty-screen'

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
  const [credits, setCredits] = useState(100)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const correctAudioRef = useRef<HTMLAudioElement | null>(null)
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    correctAudioRef.current = new Audio('/sounds/correct.mp3')
    wrongAudioRef.current = new Audio('/sounds/wrong.mp3')
  }, [])

  const playSound = (isCorrect: boolean) => {
    if (isCorrect && correctAudioRef.current) {
      correctAudioRef.current.play()
    } else if (!isCorrect && wrongAudioRef.current) {
      wrongAudioRef.current.play()
    }
  }

  const startQuiz = useCallback(async () => {
    try {
      console.log('Starting quiz generation...')
      const { quizId, questions } = await generateQuizQuestions(
        'PMP - Project Management Professional Test Exams - Level 1 easy',
        5
      )
      console.log('Quiz generated:', { quizId, questions })
      setAIState(prevState => ({
        ...prevState,
        quizId,
        questions,
        currentQuestionIndex: 0
      }))
      setIsQuizStarted(true)
      // Start the timer
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start quiz:', error)
      toast.error('Failed to start quiz. Please try again.')
    }
  }, [setAIState])

  const handleAnswerSubmit = useCallback(
    async (answer: string) => {
      setSelectedAnswer(answer)
      console.log('Submitting answer:', answer)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const isCorrect = answer === currentQuestion.correctAnswer
      setIsAnswerCorrect(isCorrect)
      const pointsEarned = isCorrect ? 10 : 0

      setScore(prevScore => prevScore + pointsEarned)
      setExperience(prevExp => prevExp + pointsEarned)
      setCredits(prevCredits => prevCredits + (isCorrect ? 5 : 0))

      playSound(isCorrect)

      await submitUserMessage(answer)

      // Check if we need to generate more questions
      if (aiState.currentQuestionIndex >= aiState.questions.length - 1) {
        const { questions } = await generateQuizQuestions(
          'PMP - Project Management Professional Test Exams - Increase Difficulty',
          5
        )
        setAIState(prevState => ({
          ...prevState,
          questions: [...prevState.questions, ...questions],
          currentQuestionIndex: prevState.currentQuestionIndex + 1
        }))
      } else {
        setAIState(prevState => ({
          ...prevState,
          currentQuestionIndex: prevState.currentQuestionIndex + 1
        }))
      }

      setSelectedAnswer(null)
      setIsAnswerCorrect(null)
      // Reset the timer for the next question
      setTimer(0)
    },
    [submitUserMessage, aiState, setAIState]
  )

  const handleSendMessage = useCallback(async () => {
    if (input.trim()) {
      console.log('Submitting user message:', input)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const messageWithContext = `Question: ${currentQuestion.question}\n\nUser's query: ${input}`
      await submitUserMessage(messageWithContext)
      setInput('')
    }
  }, [input, submitUserMessage, aiState])

  useEffect(() => {
    console.log('Current AI State:', aiState)
  }, [aiState])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (experience >= level * 100) {
      setLevel(prevLevel => prevLevel + 1)
      setCredits(prevCredits => prevCredits + 50)
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
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex items-center">
              <Coffee className="h-5 w-5 text-green-400 mr-1" />
              <span className="font-bold">{credits}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Level {level}</Badge>
            <Progress
              value={((experience % (level * 100)) / (level * 100)) * 100}
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
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
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
        {messages.map((message, index) => (
          <div
            key={index}
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
    </div>
  )
}
