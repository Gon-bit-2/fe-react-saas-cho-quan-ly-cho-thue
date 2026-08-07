import { useState } from 'react'
import { useCreateRentalRequest } from '@/shared/api/marketplace'
import { toast } from 'sonner'
import { useAuth } from '@/shared/hooks/use-auth'

interface RentalRequestDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

export function RentalRequestDrawer({ isOpen, onClose, roomId }: RentalRequestDrawerProps) {
  const { profile } = useAuth()
  const { mutate, isPending } = useCreateRentalRequest()
  
  const [expectedStartDate, setExpectedStartDate] = useState('')
  const [message, setMessage] = useState('')
  const [appointmentId, setAppointmentId] = useState<string>('')
  const [agreed, setAgreed] = useState(false)
  
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expectedStartDate) {
      toast.error('Vui lòng chọn ngày dự kiến dọn vào')
      return
    }

    if (!agreed) {
      toast.error('Vui lòng đồng ý với điều khoản')
      return
    }

    mutate(
      { 
        roomId, 
        body: { 
          expectedStartDate, // YYYY-MM-DD
          message: message || undefined,
          appointmentId: appointmentId ? Number(appointmentId) : undefined
        } 
      },
      {
        onSuccess: () => {
          toast.success('Gửi yêu cầu thuê phòng thành công')
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
        }
      }
    )
  }

  // Get current date string in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-headline-sm text-text-main">Gửi yêu cầu thuê phòng</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <form id="rental-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-border mb-6 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-label-md flex-shrink-0">
                {profile?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-label-md text-text-main">{profile?.fullName}</p>
                <p className="font-body-md text-on-surface-variant">{profile?.email}</p>
                <p className="font-body-md text-on-surface-variant">{profile?.phone || 'Chưa cập nhật SĐT'}</p>
              </div>
            </div>

            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Ngày dự kiến dọn vào <span className="text-status-overdue">*</span>
              </label>
              <input 
                type="date" 
                className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={expectedStartDate}
                onChange={e => setExpectedStartDate(e.target.value)}
                required
                min={today}
              />
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Mã lịch xem phòng (Tùy chọn)
              </label>
              <input 
                type="number" 
                placeholder="Ví dụ: 350"
                className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={appointmentId}
                onChange={e => setAppointmentId(e.target.value)}
              />
              <p className="font-label-sm text-on-surface-variant mt-1">
                Nếu bạn đã từng xem phòng này, hãy nhập mã lịch xem.
              </p>
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Tin nhắn cho chủ nhà (Tùy chọn)
              </label>
              <textarea 
                className="w-full p-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors min-h-[120px] resize-none"
                placeholder="Ví dụ: Tôi muốn thuê lâu dài, dự kiến ở 2 người..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={2000}
              />
            </div>

            <div className="flex items-start gap-3 mt-6 p-4 bg-surface-container-low rounded-xl">
              <input 
                type="checkbox" 
                id="agree" 
                className="mt-1"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree" className="font-body-md text-on-surface-variant cursor-pointer">
                Tôi xác nhận thông tin trên là chính xác và đồng ý gửi yêu cầu thuê phòng đến chủ nhà.
              </label>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-surface-border bg-surface">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-surface-container-low text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              form="rental-form"
              disabled={isPending || !agreed}
              className="flex-1 py-2 bg-primary text-on-primary font-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <span className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
