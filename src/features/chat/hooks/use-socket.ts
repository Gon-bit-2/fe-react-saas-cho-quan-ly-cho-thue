import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/app/config/env.config'
import { getAccessToken } from '@/app/config/session.store'
import type { Message, SendMessageRequest } from '@/shared/api/conversations'

export const useConversationSocket = (conversationId?: number) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Determine socket URL from env.apiUrl (e.g. http://localhost:3000/api/v1 -> http://localhost:3000/conversations)
    let socketUrl: string
    try {
      const url = new URL(env.apiUrl)
      socketUrl = `${url.origin}/conversations`
    } catch {
      socketUrl = `${env.apiUrl}/conversations` // fallback
    }

    const token = getAccessToken()

    // Connect to namespace /conversations
    socketRef.current = io(socketUrl, {
      auth: token ? { token } : {},
      withCredentials: true,
      transports: ['websocket'],
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('newMessage', (message: Message) => {
      // Only append if it's the current conversation
      if (conversationId && message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message])
      }
    })

    socket.on('messageRead', () => {
      // can be used to update UI later
    })

    socket.connect()

    return () => {
      socket.disconnect()
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
