import { useState } from 'react'
import { useCreateViewing, useMarketplaceRoom } from '@/shared/api/marketplace'
import { toast } from 'sonner'
import { useAuth } from '@/shared/hooks/use-auth'

interface BookViewingDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
}

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

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

  if (!isOpen) return null

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

    // Kết hợp Date và Time để tạo ISO string
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
          note: finalNote || undefined 
        } 
      },
      {
        onSuccess: () => {
          toast.success('Đặt lịch xem phòng thành công')
          onClose()
        },
        onError: (err: unknown) => {
          const error = err as import('axios').AxiosError<{ message: string }>
          const errMsg = error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
          if (error?.response?.status === 409 || error?.response?.status === 400) {
            setErrorAlert(`Khung giờ ${selectedTime} đã có người đặt hoặc không hợp lệ. Vui lòng chọn giờ khác.`)
          } else {
            toast.error(errMsg)
          }
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
      <div className="relative w-full max-w-[480px] bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-headline-sm text-text-main">Đặt lịch xem phòng</h2>
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
              <p className="font-label-md text-primary mb-1">MÃ: {room?.roomCode || '---'}</p>
              <h3 className="font-label-md text-text-main line-clamp-1">{room?.title || 'Đang tải...'}</h3>
              <p className="font-body-sm text-on-surface-variant line-clamp-1 mt-1">
                {room?.property?.addressDetail || 'Đang tải...'}
              </p>
            </div>
          </div>

          <form id="viewing-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Chọn Ngày */}
            <div>
              <label className="font-label-md text-on-surface mb-2 block">
                Ngày xem <span className="text-status-overdue">*</span>
              </label>
              <input 
                type="date" 
                className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={selectedDate}
                onChange={e => {
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
                <label className="font-label-md text-on-surface">
                  Khung giờ <span className="text-status-overdue">*</span>
                </label>
                <span className="font-body-sm text-on-surface-variant">Chọn 1 khung giờ</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSelectedTime(time)
                        setErrorAlert('')
                      }}
                      className={`h-11 rounded-lg font-label-md transition-colors border ${
                        isSelected 
                          ? 'bg-primary text-on-primary border-primary' 
                          : 'bg-surface-container-lowest text-on-surface border-surface-border hover:border-primary'
                      }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cảnh báo lỗi */}
            {errorAlert && (
              <div className="bg-[#fff4e5] text-[#d97706] p-3 rounded-lg flex items-start gap-2 border border-[#ffedd5]">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <p className="font-body-sm">{errorAlert}</p>
              </div>
            )}
            
            <hr className="border-surface-border my-6" />

            {/* Thông tin liên hệ */}
            <div className="space-y-4">
              <h3 className="font-label-md text-text-main">Thông tin liên hệ</h3>
              
              <div>
                <label className="font-body-sm text-on-surface-variant mb-1.5 block">
                  Họ và tên <span className="text-status-overdue">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-body-sm text-on-surface-variant mb-1.5 block">
                  Số điện thoại <span className="text-status-overdue">*</span>
                </label>
                <input 
                  type="tel" 
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-body-sm text-on-surface-variant mb-1.5 block">
                  Ghi chú thêm (Không bắt buộc)
                </label>
                <textarea 
                  className="w-full p-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors min-h-[100px] resize-none"
                  placeholder="Ví dụ: Tôi muốn xem thêm tầng hầm để xe..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={2000}
                />
              </div>
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
              form="viewing-form"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-on-primary font-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <span className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />}
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
