import { Message } from '@/lib/types'
import { useEffect, useRef } from 'react'

interface ChatMessagesProps {
  messages: Message[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="relative h-[500px]">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto no-scrollbar lg:scrollbar flex flex-col-reverse"
      >
        <div>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } mb-4`}
            >
              <div
                className={`max-w-sm rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-background to-transparent pointer-events-none" />
    </div>
  )
}
