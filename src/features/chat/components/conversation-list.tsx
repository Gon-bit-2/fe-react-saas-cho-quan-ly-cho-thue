import { useEffect, useState } from 'react'
import { conversationsApi, type Conversation } from '@/shared/api/conversations'
import { useAuth } from '@/shared/hooks/use-auth'

interface ConversationListProps {
  onSelectConversation: (id: number) => void
}

export const ConversationList = ({ onSelectConversation }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await conversationsApi.getConversations()
        setConversations(data)
      } catch (error) {
        console.error('Failed to fetch conversations', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConversations()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-on-surface-variant flex h-full flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined mb-2 text-4xl opacity-50">forum</span>
        <p>Bạn chưa có cuộc trò chuyện nào.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface flex h-full flex-col overflow-y-auto">
      {conversations.map((conv) => {
        // Find the other participant
        const participants = conv.members || conv.participants || []
        const otherParticipant = participants.find((p) => p.userId !== profile?.id)
        const otherUser = otherParticipant?.user
        const lastMessage = conv.messages?.[0]

        return (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="border-surface-border hover:bg-surface-container flex items-center gap-3 border-b p-4 text-left transition-colors"
          >
            <img
              src={
                otherUser?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.fullName || otherUser?.email || 'User')}&background=random`
              }
              alt="Avatar"
              className="border-surface-border h-12 w-12 rounded-full border object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-on-surface truncate pr-2 font-bold">
                  {otherUser?.fullName || otherUser?.email || 'Người dùng'}
                </span>
                {lastMessage && (
                  <span className="text-on-surface-variant shrink-0 text-[11px]">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-on-surface-variant truncate text-sm">
                {lastMessage
                  ? lastMessage.messageType === 'IMAGE'
                    ? 'Đã gửi một hình ảnh'
                    : lastMessage.messageType === 'FILE'
                      ? 'Đã gửi một tệp'
                      : lastMessage.content
                  : 'Bắt đầu trò chuyện...'}
              </p>
            </div>
            {lastMessage && !lastMessage.isRead && lastMessage.senderId !== profile?.id && (
              <div className="bg-primary h-3 w-3 shrink-0 rounded-full"></div>
            )}
          </button>
        )
      })}
    </div>
  )
}
