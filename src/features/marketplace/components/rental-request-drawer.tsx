import { useState } from 'react'
import { useCreateRentalRequest, useMarketplaceRoom } from '@/shared/api/marketplace'
import { toast } from 'sonner'

interface RentalRequestDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

export function RentalRequestDrawer({ isOpen, onClose, roomId }: RentalRequestDrawerProps) {
  const { data: room } = useMarketplaceRoom(roomId)
  const { mutate, isPending } = useCreateRentalRequest()
  
  const [expectedStartDate, setExpectedStartDate] = useState('')
  const [occupants, setOccupants] = useState<number>(1)
  const [message, setMessage] = useState('')
  const [hasActiveRequest, setHasActiveRequest] = useState(false)
  
  if (!isOpen) return null

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
          expectedStartDate, // YYYY-MM-DD
          message: finalMessage,
          // Bỏ trường appointmentId theo thiết kế mới, giải quyết lỗi 400
        } 
      },
      {
        onSuccess: () => {
          toast.success('Gửi yêu cầu thuê phòng thành công')
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          if (error?.response?.status === 409) {
            setHasActiveRequest(true)
          } else {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
          }
        }
      }
    )
  }

  // Get current date string in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 10)
  const maxDateString = maxDate.toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-[480px] bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-headline-sm text-text-main">Gửi yêu cầu thuê phòng</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Card Preview Phòng */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-border mb-6 flex gap-4">
            <img 
              src={room?.images?.[0]?.url || 'https://placehold.co/100'} 
              alt={room?.title || 'Phòng trọ'} 
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex flex-col justify-center">
              <h3 className="font-label-md text-text-main line-clamp-1">{room?.title || 'Đang tải...'}</h3>
              <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mt-1 line-clamp-1">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {room?.property?.addressDetail || 'Đang tải...'}
              </p>
              <p className="font-label-md text-primary mt-2">
                {room?.basePrice ? new Intl.NumberFormat('vi-VN').format(room.basePrice) : '---'} đ/tháng
              </p>
            </div>
          </div>

          {/* Cảnh báo đã có yêu cầu */}
          {hasActiveRequest && (
            <div className="bg-[#fff4e5] text-[#d97706] p-4 rounded-xl mb-6 flex items-start gap-3 border border-[#ffedd5]">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="font-body-md">Bạn đã có một yêu cầu đang hoạt động cho phòng này.</p>
            </div>
          )}

          <form id="rental-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Ngày dự kiến chuyển vào <span className="text-status-overdue">*</span>
              </label>
              <input 
                type="date" 
                className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={expectedStartDate}
                onChange={e => setExpectedStartDate(e.target.value)}
                required
                min={today}
                max={maxDateString}
              />
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Số người ở <span className="text-status-overdue">*</span>
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full h-11 px-3 pr-16 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                  value={occupants}
                  onChange={e => setOccupants(Number(e.target.value))}
                  min={1}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant pointer-events-none">
                  người
                </span>
              </div>
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Lời nhắn cho chủ trọ
              </label>
              <textarea 
                className="w-full p-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors min-h-[120px] resize-none"
                placeholder="Xin chào, tôi quan tâm đến phòng này và muốn..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={2000}
              />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-surface-border bg-surface">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface-container-lowest border border-surface-border text-on-surface font-label-md rounded-lg hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              form="rental-form"
              disabled={isPending || hasActiveRequest}
              className="flex-1 py-2.5 bg-primary text-on-primary font-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <span className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
              Gửi yêu cầu thuê
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
