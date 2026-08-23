import { useContext, useEffect, useState, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { AuthContext } from '@/app/providers/auth-provider'
import { getAccessToken } from '@/app/config/session.store'
import { SocketContext } from './socket-context'

export function SocketProvider({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Wait for auth to boot up and have a profile
  const isReady = authContext?.state === 'authenticated' && authContext?.profile

  useEffect(() => {
    if (!isReady) {
      return
    }

    const token = getAccessToken()
    if (!token) return

    // Ensure we connect to the root backend URL, which is where socket namespace is hosted
    const apiUrl = import.meta.env.VITE_API_URL || ''

    // Create socket instance to the /notifications namespace
    const socketInstance = io(`${apiUrl}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'], // Prefer websocket
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      setSocket(socketInstance)
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setConnected(false)
    })

    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [isReady]) // Reconnect if auth state changes from unauthenticated to authenticated

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}
