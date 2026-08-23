import { useEffect, useState, useRef } from 'react'
import { conversationsApi } from '@/shared/api/conversations'
import { useConversationSocket } from '../hooks/use-socket'
import { useAuth } from '@/shared/hooks/use-auth'

interface ChatWindowProps {
  conversationId: number
}

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const { profile } = useAuth()
  const { messages, setInitialMessages, sendMessage, isConnected, markAsRead } = useConversationSocket(conversationId)
  const [isLoading, setIsLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const data = await conversationsApi.getMessages(conversationId)
        // Data usually comes from newest to oldest if skipping, but let's assume it returns chronological or we reverse it.
        // For simplicity, we assume backend returns ascending order or we reverse it if needed.
        // Usually, chat history returns descending, we need to reverse it to display bottom-up.
        // Let's assume the backend returns descending order (latest first) based on most chat APIs.
        setInitialMessages(data.reverse())
        markAsRead()
      } catch (error) {
        console.error('Failed to fetch messages', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [conversationId, setInitialMessages, markAsRead])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    sendMessage({
      messageType: 'TEXT',
      content: inputText.trim(),
    })
    setInputText('')
  }

  if (isLoading) {
    return (
      <div className="bg-surface flex h-full items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="bg-surface flex h-full flex-col">
      {/* Connection status indicator (optional) */}
      {!isConnected && (
        <div className="bg-error-container text-on-error-container py-1 text-center text-xs">Đang kết nối lại...</div>
      )}

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === profile?.id
          const showAvatar = !isMine && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)

          return (
            <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
              {!isMine && (
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <img
                      src={
                        msg.sender?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.fullName || 'User')}&background=random`
                      }
                      alt="Avatar"
                      className="border-surface-border h-8 w-8 rounded-full border object-cover"
                    />
                  )}
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMine
                    ? 'bg-primary text-on-primary rounded-tr-sm'
                    : 'bg-surface-container-high text-on-surface rounded-tl-sm'
                }`}
              >
                {msg.messageType === 'TEXT' && <p className="break-words whitespace-pre-wrap">{msg.content}</p>}
                {msg.messageType === 'IMAGE' && (
                  <img src={msg.fileUrl || ''} alt="Attachment" className="max-w-full rounded-lg" />
                )}
                {msg.messageType === 'FILE' && (
                  <a
                    href={msg.fileUrl || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 underline"
                  >
                    <span className="material-symbols-outlined text-[18px]">description</span> Tệp đính kèm
                  </a>
                )}

                <div
                  className={`mt-1 text-[10px] ${isMine ? 'text-on-primary/70' : 'text-on-surface-variant'} text-right`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-surface-container-lowest border-surface-border border-t p-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="bg-surface-container focus:ring-primary text-body-md flex-1 rounded-full px-4 py-2 outline-none focus:ring-2"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-primary text-on-primary hover:bg-primary/90 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
