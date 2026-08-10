import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationApi } from '../api/notification.api';
import { Notification, NotificationType } from '../api/types';

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications({
        limit: 20,
        isRead: filter === 'UNREAD' ? false : undefined
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'INVOICE':
      case 'PAYMENT':
        return { icon: 'payments', color: 'text-emerald-600 bg-emerald-100' };
      case 'TICKET':
        return { icon: 'engineering', color: 'text-amber-600 bg-amber-100' };
      case 'CONTRACT':
        return { icon: 'description', color: 'text-blue-600 bg-blue-100' };
      case 'SYSTEM':
      default:
        return { icon: 'notifications', color: 'text-slate-600 bg-slate-100' };
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)] max-w-[800px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Trung tâm thông báo</h1>
          <p className="text-sm text-slate-500">Xem và quản lý tất cả các thông báo của bạn.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setFilter('ALL')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${filter === 'ALL' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setFilter('UNREAD')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${filter === 'UNREAD' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Chưa đọc
          {notifications.filter(n => !n.isRead).length > 0 && (
            <Badge className="bg-primary text-white ml-1 px-1.5 py-0 min-w-4 text-center">{notifications.filter(n => !n.isRead).length}</Badge>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Đang tải thông báo...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-slate-300">notifications_off</span>
            </div>
            <p>Không có thông báo nào.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {notifications.map((notification) => {
              const { icon, color } = getIconForType(notification.type);
              return (
                <div 
                  key={notification.id} 
                  className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${color}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1 pr-8">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notification.content}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }} title="Đánh dấu đã đọc">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
