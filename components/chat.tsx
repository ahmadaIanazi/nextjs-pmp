'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useUIState, useAIState, useActions } from 'ai/rsc'
import { Message, Session } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { generateQuizQuestions } from '@/lib/questions/actions'
import { Send, Star, Coffee, Brain, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

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
    } catch (error) {
      console.error('Failed to start quiz:', error)
      toast.error('Failed to start quiz. Please try again.')
    }
  }, [setAIState])

  const handleAnswerSubmit = useCallback(
    async (answer: string) => {
      console.log('Submitting answer:', answer)
      const currentQuestion = aiState.questions[aiState.currentQuestionIndex]
      const isCorrect = answer === currentQuestion.correctAnswer
      const pointsEarned = isCorrect ? 10 : 0

      setScore(prevScore => prevScore + pointsEarned)
      setExperience(prevExp => prevExp + pointsEarned)
      setCredits(prevCredits => prevCredits + (isCorrect ? 5 : 0))

      await submitUserMessage(answer)

      // Check if we need to generate more questions
      if (aiState.currentQuestionIndex >= aiState.questions.length - 1) {
        const { questions } = await generateQuizQuestions(
          'PMP - Project Management Professional Test Exams - Increase Difficulty',
          5
        )
        setAIState(prevState => ({
          ...prevState,
          questions: [...prevState.questions, ...questions]
        }))
      }
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

  if (!isQuizStarted) {
    return (
      <div className="flex items-center justify-center h-full">
        <Button onClick={startQuiz}>Start Quiz</Button>
      </div>
    )
  }

  const currentQuestion = aiState.questions[aiState.currentQuestionIndex]

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
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
        </CardContent>
      </Card>

      <ScrollArea className="flex-1" ref={scrollRef}>
        {currentQuestion && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">
                Question {aiState.currentQuestionIndex + 1}:{' '}
                {currentQuestion.question}
              </h2>
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  className="w-full mb-2"
                  onClick={() => handleAnswerSubmit(option)}
                >
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-sm rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              {message.content}
            </div>
          </motion.div>
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
