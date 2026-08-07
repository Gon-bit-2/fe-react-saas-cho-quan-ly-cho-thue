import { useState } from 'react'
import { useCreateViewing } from '@/shared/api/marketplace'
import { toast } from 'sonner'
import { useAuth } from '@/shared/hooks/use-auth'

interface BookViewingDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

export function BookViewingDrawer({ isOpen, onClose, roomId }: BookViewingDrawerProps) {
  const { profile } = useAuth()
  const { mutate, isPending } = useCreateViewing()
  
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!scheduledAt) {
      toast.error('Vui lòng chọn ngày giờ xem phòng')
      return
    }

    mutate(
      { 
        roomId, 
        body: { 
          scheduledAt: new Date(scheduledAt).toISOString(),
          note: note || undefined 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Đặt lịch xem phòng thành công')
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
        }
      }
    )
  }

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
          <h2 className="font-headline-sm text-text-main">Đặt lịch xem phòng</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <form id="viewing-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-border mb-6">
              <h3 className="font-label-md text-text-main mb-2">Thông tin liên hệ</h3>
              <p className="font-body-md text-on-surface-variant mb-1">Họ tên: {profile?.fullName}</p>
              <p className="font-body-md text-on-surface-variant">SĐT: {profile?.phone || 'Chưa cập nhật'}</p>
              <p className="font-label-sm text-primary mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Chủ nhà sẽ liên hệ qua SĐT này.
              </p>
            </div>

            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Thời gian dự kiến <span className="text-status-overdue">*</span>
              </label>
              <input 
                type="datetime-local" 
                className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Ghi chú cho chủ nhà (Tùy chọn)
              </label>
              <textarea 
                className="w-full p-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors min-h-[120px] resize-none"
                placeholder="Ví dụ: Tôi có thể đến muộn 15 phút..."
                value={note}
                onChange={e => setNote(e.target.value)}
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
              className="flex-1 py-2 bg-surface-container-low text-on-surface font-label-md rounded-lg hover:bg-surface-container transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              form="viewing-form"
              disabled={isPending}
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
