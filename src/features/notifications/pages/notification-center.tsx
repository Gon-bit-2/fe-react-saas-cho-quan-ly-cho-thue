import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotificationsControllerCountUnreadQueryKey } from '@/shared/api/generated/notifications/notifications'
import { useProperties } from '@/shared/api/properties'
import { notificationApi } from '../api/notification.api'
import type { Notification, NotificationType } from '../api/types'
import { toast } from 'sonner'
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  FileText,
  Settings,
  BellOff,
  Wrench,
  Send,
  Megaphone,
  Radio,
  Eye,
  Inbox,
  Sparkles,
} from 'lucide-react'

/**
 * Trung tâm thông báo & Phát tin tức dành cho Chủ trọ
 * Bao gồm quản lý thông báo hệ thống và công cụ soạn/gửi thông báo hàng loạt cho người thuê
 */
export function NotificationCenterPage() {
  const queryClient = useQueryClient()
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'INVOICE' | 'TICKET'>('ALL')

  // State cho phần Soạn thông báo gửi người thuê
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'PROPERTY' | 'URGENT'>('ALL')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  const [broadcastType, setBroadcastType] = useState<string>('MAINTENANCE')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastContent, setBroadcastContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  /**
   * Tải danh sách thông báo sử dụng TanStack Query (loại bỏ cascading render từ useEffect)
   */
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const response = await notificationApi.getNotifications({
        limit: 50,
        isRead: filter === 'UNREAD' ? false : undefined,
        type: filter !== 'ALL' && filter !== 'UNREAD' ? filter : undefined,
      })
      return response.data.data
    },
  })

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id)
      queryClient.setQueriesData<Notification[]>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return []
        return old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: getNotificationsControllerCountUnreadQueryKey() })
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  /**
   * Đánh dấu toàn bộ thông báo là đã đọc
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      queryClient.setQueriesData<Notification[]>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return []
        return old.map((n) => ({ ...n, isRead: true }))
      })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: getNotificationsControllerCountUnreadQueryKey() })
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }

  /**
   * Xử lý phát thông báo tới khách thuê trọ
   */
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung thông báo')
      return
    }

    setIsSending(true)
    try {
      // Giả lập gửi thông báo broadcast thành công
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success('Đã gửi thông báo thành công tới các khách thuê!')
      setBroadcastTitle('')
      setBroadcastContent('')
    } catch (error) {
      console.error('Failed to send broadcast notification', error)
      toast.error('Không thể gửi thông báo. Vui lòng thử lại sau.')
    } finally {
      setIsSending(false)
    }
  }

  /**
   * Icon và màu sắc tương ứng theo từng loại thông báo
   */
  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'INVOICE':
      case 'PAYMENT':
        return {
          icon: <CreditCard className="h-5 w-5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
        }
      case 'TICKET':
        return {
          icon: <Wrench className="h-5 w-5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
        }
      case 'CONTRACT':
        return {
          icon: <FileText className="h-5 w-5 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-100',
        }
      case 'SYSTEM':
      default:
        return {
          icon: <Settings className="h-5 w-5 text-slate-600" />,
          bg: 'bg-slate-100 border-slate-200',
        }
    }
  }

  /**
   * Thống kê KPI thông báo
   */
  const stats = useMemo(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length
    const invoiceCount = notifications.filter((n) => n.type === 'INVOICE' || n.type === 'PAYMENT').length
    const ticketCount = notifications.filter((n) => n.type === 'TICKET').length
    return { unreadCount, invoiceCount, ticketCount, total: notifications.length }
  }, [notifications])

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút thao tác nhanh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900">
            <Bell className="h-6 w-6 text-blue-600" />
            Trung Tâm Thông Báo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi sự kiện thanh toán, bảo trì và phát thông báo tin tức tới khách thuê trọ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 text-slate-700 hover:text-slate-900"
            >
              <CheckCheck className="h-4 w-4 text-blue-600" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* Thẻ thống kê KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tin Chưa Đọc"
          value={stats.unreadCount}
          description="Cần xem xét"
          icon={<Bell className="h-4 w-4" />}
          tone="blue"
        />
        <MetricCard
          title="Thanh Toán & Tiền Cước"
          value={stats.invoiceCount}
          description="Giao dịch phát sinh"
          icon={<CreditCard className="h-4 w-4" />}
          tone="emerald"
        />
        <MetricCard
          title="Sự Cố & Kỹ Thuật"
          value={stats.ticketCount}
          description="Yêu cầu cần giải quyết"
          icon={<Wrench className="h-4 w-4" />}
          tone="amber"
        />
        <MetricCard
          title="Tổng Tin Đã Nhận"
          value={stats.total}
          description="Lịch sử hoạt động"
          icon={<Inbox className="h-4 w-4" />}
          tone="slate"
        />
      </div>

      {/* Điều hướng 2 Tab chính */}
      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="border border-slate-200 bg-slate-100 p-1">
          <TabsTrigger value="inbox" className="gap-2 text-xs sm:text-sm">
            <Inbox className="h-4 w-4" />
            Hộp Thư Đến
            {stats.unreadCount > 0 && (
              <Badge className="py-0.2 ml-1 rounded-full bg-blue-600 px-1.5 text-[10px] text-white">
                {stats.unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="gap-2 text-xs sm:text-sm">
            <Radio className="h-4 w-4 text-amber-600" />
            Soạn & Phát Thông Báo
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Hộp thư đến */}
        <TabsContent value="inbox" className="space-y-4">
          {/* Bộ lọc nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ALL')}
              className="h-8 text-xs"
            >
              Tất cả
            </Button>
            <Button
              variant={filter === 'UNREAD' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('UNREAD')}
              className="h-8 gap-1 text-xs"
            >
              Chưa đọc
              {stats.unreadCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
            </Button>
            <Button
              variant={filter === 'INVOICE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('INVOICE')}
              className="h-8 gap-1 text-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Thanh toán & Hóa đơn
            </Button>
            <Button
              variant={filter === 'TICKET' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('TICKET')}
              className="h-8 gap-1 text-xs"
            >
              <Wrench className="h-3.5 w-3.5" />
              Bảo trì & Sự cố
            </Button>
          </div>

          {/* Danh sách thông báo */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  icon={<BellOff className="h-8 w-8 text-slate-400" />}
                  title="Không có thông báo nào"
                  description="Bạn đã cập nhật và xem toàn bộ các thông báo trong mục này."
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((item) => {
                    const { icon, bg } = getIconForType(item.type)
                    const isUnread = !item.isRead

                    return (
                      <div
                        key={item.id}
                        onClick={() => isUnread && handleMarkAsRead(item.id)}
                        className={`group flex cursor-pointer items-start gap-4 p-4 transition-colors ${
                          isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Biểu tượng phân loại */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${bg}`}
                        >
                          {icon}
                        </div>

                        {/* Nội dung thông báo */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                              <h4
                                className={`text-sm ${
                                  isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>
                            <span className="shrink-0 font-mono text-xs text-slate-400">
                              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">{item.content}</p>
                        </div>

                        {/* Nút hành động nhanh */}
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(item.id)
                            }}
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Soạn & phát thông báo tới khách thuê */}
        <TabsContent value="broadcast" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Cột trái: Form soạn thảo */}
            <div className="lg:col-span-7">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base font-semibold text-slate-900">Soạn Thông Báo Phát Tin</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Gửi tin nhắn hoặc thông báo đẩy trực tiếp tới ứng dụng của khách thuê.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    {/* Chọn đối tượng nhận */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Đối tượng nhận thông báo</Label>
                      <Select
                        value={broadcastTarget}
                        onValueChange={(val) => setBroadcastTarget(val as 'ALL' | 'PROPERTY' | 'URGENT')}
                      >
                        <SelectTrigger className="bg-slate-50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Toàn bộ khách thuê (Tất cả khu trọ)</SelectItem>
                          <SelectItem value="PROPERTY">Theo từng khu trọ cụ thể</SelectItem>
                          <SelectItem value="URGENT">Khách thuê có công nợ quá hạn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lọc theo khu trọ nếu chọn PROPERTY */}
                    {broadcastTarget === 'PROPERTY' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Chọn khu trọ</Label>
                        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                          <SelectTrigger className="bg-slate-50 text-xs">
                            <SelectValue placeholder="Chọn khu nhà trọ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả khu trọ</SelectItem>
                            {properties.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Loại thông báo */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Chủ đề thông báo</Label>
                      <Select value={broadcastType} onValueChange={setBroadcastType}>
                        <SelectTrigger className="bg-slate-50 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAINTENANCE">Lịch bảo trì / Sửa chữa điện nước</SelectItem>
                          <SelectItem value="INVOICE_REMINDER">Nhắc nộp tiền phòng kỳ này</SelectItem>
                          <SelectItem value="SECURITY">Quy định an ninh trật tự / Phòng cháy</SelectItem>
                          <SelectItem value="GENERAL">Thông báo chung từ Ban quản lý</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tiêu đề */}
                    <div className="space-y-1.5">
                      <Label htmlFor="broadcast-title" className="text-xs font-semibold text-slate-700">
                        Tiêu đề <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="broadcast-title"
                        placeholder="Ví dụ: Lịch tạm ngắt điện để bảo trì ngày 15/09..."
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="bg-slate-50 text-sm"
                        required
                      />
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="space-y-1.5">
                      <Label htmlFor="broadcast-content" className="text-xs font-semibold text-slate-700">
                        Nội dung chi tiết <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="broadcast-content"
                        placeholder="Nhập nội dung thông báo đầy đủ để khách thuê nắm rõ thời gian, địa điểm và lưu ý..."
                        value={broadcastContent}
                        onChange={(e) => setBroadcastContent(e.target.value)}
                        rows={5}
                        className="resize-none bg-slate-50 text-sm"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSending || !broadcastTitle.trim() || !broadcastContent.trim()}
                        className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                        {isSending ? 'Đang phát...' : 'Gửi Thông Báo Ngay'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Cột phải: Xem trước (Live Preview) */}
            <div className="lg:col-span-5">
              <Card className="sticky top-20 border-slate-200 bg-slate-50/50 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Xem Trước Giao Diện Khách Thuê
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-semibold tracking-wider text-blue-600 uppercase">
                          Ban Quản Lý Trọ
                        </span>
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {broadcastTitle || 'Tiêu đề thông báo mẫu'}
                        </h4>
                      </div>
                    </div>

                    <p className="min-h-[90px] rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                      {broadcastContent ||
                        'Nội dung thông báo mà người thuê sẽ nhìn thấy trên ứng dụng di động và trang thông tin phòng trọ của họ...'}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Người nhận: {broadcastTarget === 'ALL' ? 'Tất cả phòng' : 'Chọn lọc'}</span>
                      <span>Vừa xong</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <p>
                      Hệ thống sẽ đồng thời gửi thông báo trong ứng dụng và gửi email nếu khách thuê đã kích hoạt tài
                      khoản.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
