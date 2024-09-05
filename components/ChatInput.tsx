import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ChatInputProps {
  onSendMessage: (input: string) => void
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
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
  )
}
