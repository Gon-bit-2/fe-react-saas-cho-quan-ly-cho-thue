import { useContext, useEffect, useState, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { env } from '@/app/config/env.config'
import { AuthContext } from '@/app/providers/auth-provider'
import { getAccessToken } from '@/app/config/session.store'
import { SocketContext } from './socket-context'

/**
 * Xây dựng URL kết nối cho namespace `/notifications` từ cấu hình `env.apiUrl`.
 */
function buildNotificationsSocketUrl(): string {
  try {
    const url = new URL(env.apiUrl)
    return `${url.origin}/notifications`
  } catch {
    return `${env.apiUrl}/notifications`
  }
}

/**
 * Provider quản lý kết nối Socket.IO cho hệ thống thông báo realtime (`/notifications`).
 * Tự động kết nối khi phiên đăng nhập đã xác thực và ngắt kết nối khi đăng xuất.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Chỉ kết nối khi đã xác thực thành công và có profile
  const isReady = authContext?.state === 'authenticated' && Boolean(authContext?.profile)

  useEffect(() => {
    if (!isReady) {
      return
    }

    const initialToken = getAccessToken()
    if (!initialToken) return

    const socketInstance = io(buildNotificationsSocketUrl(), {
      // Dùng callback cho auth để khi socket tự động reconnect sẽ luôn lấy access token mới nhất
      auth: (cb) => {
        const currentToken = getAccessToken()
        cb(currentToken ? { token: currentToken } : {})
      },
      transports: ['websocket', 'polling'],
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
  }, [isReady])

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>
}
