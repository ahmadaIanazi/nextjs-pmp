import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Star, Coffee, Brain, Zap, Clock } from 'lucide-react'

const quizQuestions = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris'
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars'
  },
  {
    question: 'What is the largest mammal in the world?',
    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    correctAnswer: 'Blue Whale'
  }
]

export default function EnhancedAITriviaChallenge() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Welcome to the Enhanced AI Trivia Challenge! I'm your AI host. Are you ready to test your knowledge? Let's begin!"
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [quizHistory, setQuizHistory] = useState([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [streak, setStreak] = useState(0)
  const [credits, setCredits] = useState(100)
  const [timer, setTimer] = useState(0)
  const intervalRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1)
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (experience >= level * 100) {
      setLevel(prevLevel => prevLevel + 1)
      setCredits(prevCredits => prevCredits + 50)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Congratulations! You've reached level ${level + 1}! You've earned 50 bonus credits.`
        }
      ])
    }
  }, [experience, level])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [quizHistory])

  const handleAnswerSubmit = useCallback(
    selectedAnswer => {
      const currentQuestion = quizQuestions[currentQuestionIndex]
      const correct = selectedAnswer === currentQuestion.correctAnswer
      const pointsEarned = correct ? 10 + streak * 2 : 0

      setScore(prevScore => prevScore + pointsEarned)
      setExperience(prevExp => prevExp + pointsEarned)
      setStreak(correct ? prevStreak => prevStreak + 1 : 0)

      const newMessages = [
        { role: 'user', content: `My answer: ${selectedAnswer}` },
        {
          role: 'assistant',
          content: correct
            ? `That's correct! Great job! You've earned ${pointsEarned} points. Your streak is now ${streak + 1}!`
            : `Oops! That's not quite right. The correct answer is ${currentQuestion.correctAnswer}. Don't worry, you'll get it next time!`
        }
      ]
      setMessages(prev => [...prev, ...newMessages])

      setQuizHistory(prev => [
        ...prev,
        {
          questionIndex: currentQuestionIndex,
          question: currentQuestion.question,
          userAnswer: selectedAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          isCorrect: correct
        }
      ])

      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: "Here's your next question! Good luck!"
          }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content:
              "Congratulations! You've completed the AI Trivia Challenge. How about another round?"
          }
        ])
      }
    },
    [currentQuestionIndex, streak]
  )

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      const newMessage = { role: 'user', content: inputMessage }
      setMessages(prev => [...prev, newMessage])
      // Simulated AI response
      const aiResponse = {
        role: 'assistant',
        content:
          "That's a great question! I'm here to help. The answer to your question involves..."
      }
      setMessages(prev => [...prev, aiResponse])
      setInputMessage('')
    }
  }, [inputMessage])

  const useHint = () => {
    if (credits >= 10) {
      setCredits(prevCredits => prevCredits - 10)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Here's a hint: Think about the most famous characteristic or fact associated with the subject of the question."
        }
      ])
    }
  }

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Game Stats */}
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
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Area */}
      <ScrollArea className="h-[60vh]" ref={scrollRef}>
        {quizHistory.map((item, index) => (
          <Card key={index} className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">
                Question {item.questionIndex + 1}
              </h2>
              <p className="mb-2">{item.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {quizQuestions[item.questionIndex].options.map(
                  (option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      variant={
                        option === item.userAnswer
                          ? item.isCorrect
                            ? 'success'
                            : 'destructive'
                          : 'outline'
                      }
                      className="w-full"
                      disabled
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
              {!item.isCorrect && (
                <p className="mt-2 text-green-600">
                  Correct answer: {item.correctAnswer}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {currentQuestionIndex < quizQuestions.length && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">
                Question {currentQuestionIndex + 1}
              </h2>
              <p className="mb-2">
                {quizQuestions[currentQuestionIndex].question}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quizQuestions[currentQuestionIndex].options.map(
                  (option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAnswerSubmit(option)}
                    >
                      {option}
                    </Button>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2">
        <Button variant="outline" onClick={useHint} disabled={credits < 10}>
          <Zap className="mr-2 h-4 w-4" />
          Hint (10 credits)
        </Button>
      </div>

      {/* Chat Area */}
      <div className="bg-background rounded-lg p-4">
        <ScrollArea className="h-[200px] mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center">
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Ask the AI host a question..."
            className="flex-1 mr-2"
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
