import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/app/config/env.config'
import { getAccessToken, subscribe } from '@/app/config/session.store'
import type { Message, SendMessageRequest } from '@/shared/api/conversations'

// Global Socket Instance để tránh tạo nhiều connection khi mount ở nhiều component
let globalSocket: Socket | null = null
let subscriberCount = 0

/**
 * Xây dựng URL kết nối cho namespace `/conversations` từ cấu hình `env.apiUrl`.
 */
function buildChatSocketUrl(): string {
  try {
    const url = new URL(env.apiUrl)
    return `${url.origin}/conversations`
  } catch {
    return `${env.apiUrl}/conversations`
  }
}

/**
 * Khởi tạo hoặc lấy lại instance Socket.IO dùng chung cho tính năng Chat.
 * Chỉ được gọi bên trong `useEffect` (không gọi trong quá trình render).
 */
const initSocket = (): Socket => {
  if (!globalSocket) {
    const socketUrl = buildChatSocketUrl()

    globalSocket = io(socketUrl, {
      // Truyền hàm callback cho auth để mỗi lần kết nối/kết nối lại luôn lấy access token mới nhất
      auth: (cb) => {
        const token = getAccessToken()
        cb(token ? { token } : {})
      },
      withCredentials: true,
      transports: ['websocket'],
    })
  }
  return globalSocket
}

/**
 * Giải phóng kết nối socket khi không còn component nào lắng nghe.
 */
const releaseSocket = () => {
  if (subscriberCount <= 0 && globalSocket) {
    subscriberCount = 0
    globalSocket.disconnect()
    globalSocket = null
  }
}

// Tự động ngắt kết nối chat socket khi phiên đăng nhập kết thúc (logout hoặc hết hạn)
subscribe((state) => {
  if ((state === 'anonymous' || state === 'expired') && globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
    subscriberCount = 0
  }
})

/**
 * Hook lắng nghe sự kiện chat toàn cục (không phụ thuộc vào một phòng chat cụ thể).
 */
export const useGlobalChatSocket = () => {
  const [isConnected, setIsConnected] = useState(() => Boolean(globalSocket?.connected))
  const [lastMessage, setLastMessage] = useState<Message | null>(null)

  useEffect(() => {
    const socket = initSocket()
    subscriberCount++

    /** Cập nhật trạng thái khi kết nối socket thành công */
    const onConnect = () => setIsConnected(true)
    /** Cập nhật trạng thái khi ngắt kết nối socket */
    const onDisconnect = () => setIsConnected(false)
    /** Lưu lại tin nhắn mới nhất nhận được từ server */
    const onNewMessage = (msg: Message) => setLastMessage(msg)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('newMessage', onNewMessage)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('newMessage', onNewMessage)

      subscriberCount--
      releaseSocket()
    }
  }, [])

  return { isConnected, lastMessage }
}

/**
 * Hook quản lý kết nối socket và tin nhắn realtime cho một cuộc hội thoại cụ thể.
 */
export const useConversationSocket = (conversationId?: number) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(() => Boolean(globalSocket?.connected))
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = initSocket()
    socketRef.current = socket
    subscriberCount++

    /** Cập nhật trạng thái khi kết nối socket thành công */
    const onConnect = () => setIsConnected(true)
    /** Cập nhật trạng thái khi ngắt kết nối socket */
    const onDisconnect = () => setIsConnected(false)
    /** Nhận tin nhắn mới thuộc cuộc hội thoại hiện tại và chống trùng lặp */
    const onNewMessage = (message: Message) => {
      if (conversationId && message.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('newMessage', onNewMessage)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('newMessage', onNewMessage)

      subscriberCount--
      releaseSocket()
    }
  }, [conversationId])

  // Tham gia (join) vào room của cuộc hội thoại khi đã kết nối
  useEffect(() => {
    const socket = socketRef.current
    if (socket && isConnected && conversationId) {
      socket.emit('joinConversation', { conversationId })
      return () => {
        socket.emit('leaveConversation', { conversationId })
      }
    }
  }, [isConnected, conversationId])

  /**
   * Gửi tin nhắn mới qua socket tới cuộc hội thoại hiện tại.
   */
  const sendMessage = useCallback(
    (payload: SendMessageRequest) => {
      const socket = socketRef.current
      if (socket && isConnected && conversationId) {
        socket.emit('sendMessage', { conversationId, message: payload })
      }
    },
    [isConnected, conversationId],
  )

  /**
   * Đánh dấu cuộc hội thoại hiện tại là đã đọc.
   */
  const markAsRead = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && conversationId) {
      socket.emit('markAsRead', { conversationId })
    }
  }, [isConnected, conversationId])

  /**
   * Thiết lập danh sách tin nhắn ban đầu khi tải lịch sử hội thoại.
   */
  const setInitialMessages = useCallback((initial: Message[]) => {
    setMessages(initial)
  }, [])

  return {
    messages,
    isConnected,
    sendMessage,
    markAsRead,
    setInitialMessages,
  }
}
