import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notificationApi } from '../api/notification.api'
import type { Notification, NotificationType } from '../api/types'

export function NotificationCenterPage() {
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
          setNotifications(response.data)
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
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'INVOICE':
      case 'PAYMENT':
        return { icon: 'payments', color: 'text-emerald-600 bg-emerald-100' }
      case 'TICKET':
        return { icon: 'engineering', color: 'text-amber-600 bg-amber-100' }
      case 'CONTRACT':
        return { icon: 'description', color: 'text-blue-600 bg-blue-100' }
      case 'SYSTEM':
      default:
        return { icon: 'notifications', color: 'text-slate-600 bg-slate-100' }
    }
  }

  return (
    <div className="bg-background mx-auto flex h-full min-h-[calc(100vh-64px)] w-full max-w-[800px] flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Trung tâm thông báo</h1>
          <p className="text-sm text-slate-500">Xem và quản lý tất cả các thông báo của bạn.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="mb-6 flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setFilter('ALL')}
          className={`border-b-2 pb-3 text-sm font-medium transition-colors ${filter === 'ALL' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${filter === 'UNREAD' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Chưa đọc
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <Badge className="bg-primary ml-1 min-w-4 px-1.5 py-0 text-center text-white">
              {notifications.filter((n) => !n.isRead).length}
            </Badge>
          )}
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Đang tải thông báo...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <span className="material-symbols-outlined text-[32px] text-slate-300">notifications_off</span>
            </div>
            <p>Không có thông báo nào.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {notifications.map((notification) => {
              const { icon, color } = getIconForType(notification.type)
              return (
                <div
                  key={notification.id}
                  className={`group relative flex cursor-pointer gap-4 p-4 transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  {!notification.isRead && <div className="bg-primary absolute top-0 bottom-0 left-0 w-1"></div>}

                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>

                  <div className="flex flex-1 flex-col gap-1 pr-8">
                    <div className="flex items-start justify-between gap-4">
                      <h4
                        className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-xs whitespace-nowrap text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notification.content}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        title="Đánh dấu đã đọc"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
