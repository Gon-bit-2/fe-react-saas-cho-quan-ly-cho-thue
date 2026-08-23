import { useState, useEffect } from 'react'
import { ConversationList } from './conversation-list'
import { ChatWindow } from './chat-window'
import { useAuth } from '@/shared/hooks/use-auth'

export const FloatingChatWidget = () => {
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ conversationId: number }>
      setIsOpen(true)
      setActiveConversationId(customEvent.detail.conversationId)
    }

    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
  }, [])

  // Nếu chưa đăng nhập thì không hiện tính năng chat
  if (!profile) return null

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary text-on-primary fixed right-6 bottom-6 z-50 flex items-center justify-center rounded-full p-4 shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
        aria-label="Mở tin nhắn"
      >
        <span className="material-symbols-outlined text-3xl">chat</span>
        {/* Optional: unread badge here if implemented */}
      </button>
    )
  }

  return (
    <div className="bg-surface border-surface-border animate-in slide-in-from-bottom-5 fade-in fixed right-6 bottom-6 z-50 flex h-[540px] w-[360px] flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
      <div className="bg-primary text-on-primary z-10 flex items-center justify-between p-3 shadow-sm">
        <h3 className="font-title-md flex items-center gap-2 font-bold">
          {activeConversationId ? (
            <button
              onClick={() => setActiveConversationId(null)}
              className="hover:bg-primary-fixed hover:text-on-primary-fixed-variant flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              aria-label="Quay lại"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">forum</span>
            </div>
          )}
          Tin nhắn
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-primary-fixed hover:text-on-primary-fixed-variant flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {activeConversationId ? (
          <ChatWindow conversationId={activeConversationId} />
        ) : (
          <ConversationList onSelectConversation={setActiveConversationId} />
        )}
      </div>
    </div>
  )
}
