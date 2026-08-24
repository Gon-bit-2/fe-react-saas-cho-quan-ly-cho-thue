import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notificationApi } from '../api/notification.api'
import type { Notification, NotificationType } from '../api/types'
import { Bell, Check, CheckCheck, CreditCard, FileText, Settings, BellOff, MoreHorizontal, Wrench } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { getNotificationsControllerCountUnreadQueryKey } from '@/shared/api/generated/notifications/notifications'

export function NotificationCenterPage() {
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')

  useEffect(() => {
    let ignore = false
    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await notificationApi.getNotifications({
          limit: 20,
          isRead: filter === 'UNREAD' ? false : undefined,
        })
        if (!ignore) {
          setNotifications(response.data.data)
        }
      } catch (error) {
        console.error('Failed to load notifications', error)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }
    loadNotifications()
    return () => {
      ignore = true
    }
  }, [filter])

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      queryClient.invalidateQueries({ queryKey: getNotificationsControllerCountUnreadQueryKey() })
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      queryClient.invalidateQueries({ queryKey: getNotificationsControllerCountUnreadQueryKey() })
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'INVOICE':
      case 'PAYMENT':
        return { icon: <CreditCard className="h-5 w-5" />, color: 'text-emerald-600 bg-emerald-100' }
      case 'TICKET':
        return { icon: <Wrench className="h-5 w-5" />, color: 'text-amber-600 bg-amber-100' }
      case 'CONTRACT':
        return { icon: <FileText className="h-5 w-5" />, color: 'text-blue-600 bg-blue-100' }
      case 'SYSTEM':
      default:
        return { icon: <Settings className="h-5 w-5" />, color: 'text-slate-600 bg-slate-100' }
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-6 pb-12 duration-500">
      <div className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Bell className="h-6 w-6 text-blue-600" />
            Trung tâm thông báo
          </h1>
          <p className="mt-1 text-sm text-slate-500">Cập nhật những hoạt động mới nhất liên quan đến bạn.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 bg-white whitespace-nowrap text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <CheckCheck className="h-4 w-4 text-blue-600" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setFilter('ALL')}
            className={`relative flex-1 px-6 py-4 text-sm font-semibold transition-colors sm:flex-none ${
              filter === 'ALL' ? 'text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            Tất cả
            {filter === 'ALL' && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`relative flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors sm:flex-none ${
              filter === 'UNREAD' ? 'text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <Badge className="flex h-5 min-w-[20px] items-center justify-center rounded-full border-transparent bg-blue-100 px-1.5 text-xs text-blue-700 hover:bg-blue-200">
                {unreadCount}
              </Badge>
            )}
            {filter === 'UNREAD' && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex min-h-[400px] flex-col">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-slate-500">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              Đang tải thông báo...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-slate-500">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                <BellOff className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-700">Không có thông báo nào</h3>
              <p className="text-sm">Bạn đã xem tất cả các thông báo hiện có.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {notifications.map((notification) => {
                const { icon, color } = getIconForType(notification.type)
                const isUnread = !notification.isRead

                return (
                  <div
                    key={notification.id}
                    className={`group relative flex cursor-pointer gap-4 p-5 transition-colors ${
                      isUnread ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => isUnread && handleMarkAsRead(notification.id)}
                  >
                    {isUnread && (
                      <div className="absolute top-1/2 left-2.5 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
                    )}

                    <div className={`ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}>
                      {icon}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 pr-12 sm:pr-24">
                      <div className="mb-0.5 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <h4
                          className={`text-base leading-tight ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}
                        >
                          {notification.title}
                        </h4>
                        <span className="hidden text-xs font-medium whitespace-nowrap text-slate-400 sm:block">
                          {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                        {notification.content}
                      </p>
                      <span className="mt-2 text-xs font-medium text-slate-400 sm:hidden">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        lúc{' '}
                        {new Date(notification.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="absolute top-5 right-5 flex gap-2">
                      {isUnread ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                          title="Tùy chọn khác"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
