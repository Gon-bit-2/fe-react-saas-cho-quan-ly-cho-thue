import { useNotificationsSocket } from '@/features/notifications/hooks/use-notifications-socket'

export function SocketListener() {
  useNotificationsSocket()
  return null
}
