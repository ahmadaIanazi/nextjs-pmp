import { Star, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface QuizHeaderProps {
  score: number
  level: number
  experience: number
  timer: number
}

export function QuizHeader({
  score,
  level,
  experience,
  timer
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="font-bold">Score: {score}</span>
          </div>
          <div className="flex items-center">
            <Badge variant="secondary">Level: {level}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
  )
}
