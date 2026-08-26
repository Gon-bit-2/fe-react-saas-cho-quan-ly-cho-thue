import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/app/config/env.config'
import { getAccessToken } from '@/app/config/session.store'
import type { Message, SendMessageRequest } from '@/shared/api/conversations'

// Global Socket Instance để tránh tạo nhiều connection khi mount ở nhiều component
let globalSocket: Socket | null = null
let subscriberCount = 0

const initSocket = () => {
  if (!globalSocket) {
    let socketUrl: string
    try {
      const url = new URL(env.apiUrl)
      socketUrl = `${url.origin}/conversations`
    } catch {
      socketUrl = `${env.apiUrl}/conversations`
    }

    const token = getAccessToken()
    globalSocket = io(socketUrl, {
      auth: token ? { token } : {},
      withCredentials: true,
      transports: ['websocket'],
    })
  }
  return globalSocket
}

const releaseSocket = () => {
  if (subscriberCount <= 0 && globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}

/** Hook lắng nghe sự kiện chat global không phụ thuộc phòng */
export const useGlobalChatSocket = () => {
  const [isConnected, setIsConnected] = useState(() => {
    const s = initSocket()
    return s.connected
  })
  const [lastMessage, setLastMessage] = useState<Message | null>(null)

  useEffect(() => {
    const socket = initSocket()
    subscriberCount++

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    const onNewMessage = (msg: Message) => setLastMessage(msg)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    // Sửa lại: Backend sẽ trả qua 'newMessage' (kể cả broadcast vô user_id room)
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

export const useConversationSocket = (conversationId?: number) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(() => {
    const s = initSocket()
    return s.connected
  })
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = initSocket()
    socketRef.current = socket
    subscriberCount++

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    const onNewMessage = (message: Message) => {
      if (conversationId && message.conversationId === conversationId) {
        setMessages((prev) => {
          // Tránh duplicate tin nhắn (vì react strict mode hoặc socket bắn nhiều lần)
          if (prev.some((m) => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('newMessage', onNewMessage)
    socket.on('messageRead', () => {})

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('newMessage', onNewMessage)

      subscriberCount--
      releaseSocket()
    }
  }, [conversationId])

  // Join a specific conversation room
  useEffect(() => {
    const socket = socketRef.current
    if (socket && isConnected && conversationId) {
      socket.emit('joinConversation', { conversationId })
      return () => {
        socket.emit('leaveConversation', { conversationId })
      }
    }
  }, [isConnected, conversationId])

  const sendMessage = useCallback(
    (payload: SendMessageRequest) => {
      const socket = socketRef.current
      if (socket && isConnected && conversationId) {
        socket.emit('sendMessage', { conversationId, message: payload })
      }
    },
    [isConnected, conversationId],
  )

  const markAsRead = useCallback(() => {
    const socket = socketRef.current
    if (socket && isConnected && conversationId) {
      socket.emit('markAsRead', { conversationId })
    }
  }, [isConnected, conversationId])

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
