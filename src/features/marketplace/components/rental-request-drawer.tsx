import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, Users, Send, AlertTriangle, MapPin } from 'lucide-react'
import { useCreateRentalRequest, useMarketplaceRoom } from '@/shared/api/marketplace'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

interface RentalRequestDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

/**
 * Drawer gửi yêu cầu thuê phòng (ActionDrawer theo DESIGN.md).
 * Cho phép khách thuê đặt ngày chuyển vào, số lượng người và lời nhắn gửi đến chủ nhà.
 */
export function RentalRequestDrawer({ isOpen, onClose, roomId }: RentalRequestDrawerProps) {
  const { data: room } = useMarketplaceRoom(roomId)
  const { mutate, isPending } = useCreateRentalRequest()
  const navigate = useNavigate()

  const [expectedStartDate, setExpectedStartDate] = useState('')
  const [occupants, setOccupants] = useState<number>(1)
  const [message, setMessage] = useState('')
  const [hasActiveRequest, setHasActiveRequest] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateString = maxDate.toISOString().split('T')[0]

  /**
   * Xử lý nộp biểu mẫu yêu cầu thuê
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!expectedStartDate) {
      toast.error('Vui lòng chọn ngày dự kiến chuyển vào')
      return
    }

    if (!occupants || occupants <= 0) {
      toast.error('Vui lòng nhập số người ở hợp lệ')
      return
    }

    const finalMessage = `Số người ở dự kiến: ${occupants} người.\nLời nhắn: ${message || 'Không có'}`

    mutate(
      {
        roomId,
        body: {
          expectedStartDate,
          message: finalMessage,
        },
      },
      {
        onSuccess: () => {
          toast.success('Gửi yêu cầu thuê phòng thành công', {
            description: 'Chủ nhà sẽ nhận được thông báo để duyệt yêu cầu thuê của bạn.',
          })
          onClose()
          navigate('/tai-khoan/yeu-cau-thue')
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          if (error?.response?.status === 409) {
            setHasActiveRequest(true)
            toast.warning('Bạn đã có yêu cầu thuê đang chờ xử lý cho phòng này')
          } else {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
          }
        },
      }
    )
  }

  const formattedPrice = room?.basePrice
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(room.basePrice)
    : '---'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="p-6 border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Send className="size-5 text-primary" />
            Gửi yêu cầu thuê phòng
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Gửi thông tin chuyển vào và số lượng người ở để chủ trọ chuẩn bị hợp đồng.
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Card Preview Phòng */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex gap-3.5 items-center">
            <img
              src={room?.images?.[0]?.url || 'https://placehold.co/100'}
              alt={room?.title || 'Phòng trọ'}
              className="size-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm text-slate-900 line-clamp-1">
                {room?.title || 'Đang tải thông tin...'}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                <MapPin className="size-3 text-slate-400" />
                {room?.property?.addressDetail || 'Đang tải...'}
              </p>
              <span className="text-xs font-bold text-primary block mt-1">{formattedPrice}/tháng</span>
            </div>
          </div>

          {/* Cảnh báo đã có yêu cầu */}
          {hasActiveRequest && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-xs">
                Bạn đang có một yêu cầu thuê chưa hoàn tất cho phòng này. Vui lòng kiểm tra lại trong mục Yêu cầu thuê cá nhân.
              </AlertDescription>
            </Alert>
          )}

          <form id="rental-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Ngày dự kiến chuyển vào <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                className="h-10 rounded-xl"
                value={expectedStartDate}
                onChange={(e) => setExpectedStartDate(e.target.value)}
                required
                min={today}
                max={maxDateString}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                Số người ở dự kiến <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  className="h-10 rounded-xl pr-14"
                  value={occupants}
                  onChange={(e) => setOccupants(Number(e.target.value))}
                  min={1}
                  max={room?.maxOccupants || 10}
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  người
                </span>
              </div>
              {room?.maxOccupants && (
                <p className="text-[11px] text-slate-400 mt-1">Sức chứa tối đa phòng này: {room.maxOccupants} người</p>
              )}
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 block">
                Lời nhắn gửi chủ trọ (Không bắt buộc)
              </label>
              <Textarea
                placeholder="Ví dụ: Xin chào, tôi hiện là sinh viên/nhân viên văn phòng, dự kiến thuê dài hạn..."
                className="min-h-[100px] resize-none rounded-xl"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Hủy
          </Button>
          <Button
            type="submit"
            form="rental-form"
            disabled={isPending || hasActiveRequest}
            className="flex-1 rounded-xl font-medium"
          >
            {isPending ? 'Đang gửi...' : 'Gửi yêu cầu thuê'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
