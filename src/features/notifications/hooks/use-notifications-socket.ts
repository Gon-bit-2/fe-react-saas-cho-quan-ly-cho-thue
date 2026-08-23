import { useEffect } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/app/providers/socket-context'

type NotificationPayload = {
  title?: string
  content: string
}

type TicketPayload = {
  ticketId: string | number
}

export function useNotificationsSocket() {
  const { socket, connected } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !connected) return

    const handleNotificationCreated = (payload: NotificationPayload) => {
      // Show toast
      toast.info(payload.title || 'Thông báo mới', {
        description: payload.content,
      })

      // Invalidate queries so that the notification bell counter updates
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    }

    const handleNotificationRead = () => {
      // Update unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    }

    const handleTicketUpdated = (payload: TicketPayload) => {
      toast.info('Sự cố được cập nhật', {
        description: `Sự cố #${payload.ticketId} đã được cập nhật.`,
      })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }

    socket.on('notification.created', handleNotificationCreated)
    socket.on('notification.read', handleNotificationRead)
    socket.on('ticket.updated', handleTicketUpdated)

    return () => {
      socket.off('notification.created', handleNotificationCreated)
      socket.off('notification.read', handleNotificationRead)
      socket.off('ticket.updated', handleTicketUpdated)
    }
  }, [socket, connected, queryClient])

  return { connected }
}
