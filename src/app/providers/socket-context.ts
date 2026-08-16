import { createContext, useContext } from 'react'
import type { Socket } from 'socket.io-client'

export interface SocketContextValue {
  socket: Socket | null
  connected: boolean
}

export const SocketContext = createContext<SocketContextValue | null>(null)

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
