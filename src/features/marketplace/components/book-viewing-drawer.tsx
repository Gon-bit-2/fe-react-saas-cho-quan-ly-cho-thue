import { useState } from 'react'
import { Calendar, Clock, User, Phone, FileText, AlertCircle, Building } from 'lucide-react'
import { useCreateViewing, useMarketplaceRoom } from '@/shared/api/marketplace'
import { toast } from 'sonner'
import { useAuth } from '@/shared/hooks/use-auth'
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

interface BookViewingDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

/**
 * Drawer đặt lịch xem phòng trực tiếp (ActionDrawer theo DESIGN.md).
 * Sử dụng Shadcn UI Sheet, Input, Button, Textarea.
 */
export function BookViewingDrawer({ isOpen, onClose, roomId }: BookViewingDrawerProps) {
  const { profile } = useAuth()
  const { data: room } = useMarketplaceRoom(roomId)
  const { mutate, isPending } = useCreateViewing()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const [name, setName] = useState(profile?.fullName || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [note, setNote] = useState('')

  const [errorAlert, setErrorAlert] = useState('')

  const today = new Date().toISOString().split('T')[0]

  /**
   * Xử lý gửi biểu mẫu đặt lịch xem phòng
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorAlert('')

    if (!selectedDate || !selectedTime) {
      toast.error('Vui lòng chọn ngày và khung giờ xem phòng')
      return
    }

    if (!name.trim() || !phone.trim()) {
      toast.error('Vui lòng điền đủ họ tên và số điện thoại')
      return
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString()

    let finalNote = note
    if (name !== profile?.fullName || phone !== profile?.phone) {
      finalNote = `Người đặt: ${name}, SĐT liên hệ: ${phone}.\n${note}`
    }

    mutate(
      {
        roomId,
        body: {
          scheduledAt,
          note: finalNote || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Đặt lịch xem phòng thành công', {
            description: 'Chủ nhà sẽ nhận được thông báo và liên hệ xác nhận với bạn.',
          })
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          const message = error?.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch, vui lòng thử lại sau.'
          setErrorAlert(message)
          toast.error(message)
        },
      }
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="p-6 border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Calendar className="size-5 text-primary" />
            Đặt lịch xem phòng
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Chọn thời gian phù hợp để đến xem trực tiếp không gian phòng.
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
              <span className="text-xs font-bold text-primary block">MÃ: {room?.roomCode || '---'}</span>
              <h4 className="font-heading font-semibold text-sm text-slate-900 line-clamp-1">
                {room?.title || 'Đang tải thông tin...'}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {room?.property?.addressDetail || 'Đang tải...'}
              </p>
            </div>
          </div>

          <form id="viewing-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Chọn Ngày */}
            <div>
              <label className="text-sm font-medium text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Ngày xem phòng <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                className="h-10 rounded-xl"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setErrorAlert('')
                }}
                required
                min={today}
              />
            </div>

            {/* Chọn Khung Giờ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  Khung giờ dự kiến <span className="text-destructive">*</span>
                </label>
                <span className="text-xs text-slate-500">Chọn 1 khung giờ</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTime(time)
                        setErrorAlert('')
                      }}
                      className="rounded-xl h-10 font-medium"
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Cảnh báo lỗi */}
            {errorAlert && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{errorAlert}</AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Thông tin liên hệ */}
            <div className="space-y-3.5">
              <h4 className="font-heading font-semibold text-sm text-slate-900">Thông tin liên hệ người xem</h4>

              <div>
                <label className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <User className="size-3 text-slate-400" />
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  className="h-10 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="size-3 text-slate-400" />
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Nhập số điện thoại liên hệ..."
                  className="h-10 rounded-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <FileText className="size-3 text-slate-400" />
                  Ghi chú thêm cho chủ nhà
                </label>
                <Textarea
                  placeholder="Ví dụ: Tôi muốn hỏi thêm về chỗ để xe máy..."
                  className="min-h-[80px] resize-none rounded-xl"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Hủy
          </Button>
          <Button
            type="submit"
            form="viewing-form"
            disabled={isPending}
            className="flex-1 rounded-xl font-medium"
          >
            {isPending ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
