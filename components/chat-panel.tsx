import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useAIState, useActions } from 'ai/rsc'

export function ChatPanel({ id, input, setInput, isAtBottom, scrollToBottom }) {
  const [aiState] = useAIState()
  const { submitUserMessage } = useActions()

  const handleSendMessage = React.useCallback(async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input }
      // Update messages state (this should be handled in the parent component)
      // setMessages(prev => [...prev, userMessage])

      const responseMessage = await submitUserMessage(input)

      // Update messages state (this should be handled in the parent component)
      // setMessages(prev => [...prev, responseMessage])
      setInput('')
      scrollToBottom()
    }
  }, [input, setInput, scrollToBottom, submitUserMessage])

  return (
    <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
      <div className="flex items-center">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask for an explanation..."
          className="flex-1 mr-2"
          onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
