import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { format } from 'date-fns'
import { listingsModerationApi } from '@/shared/api/listings-moderation'

export function ModerationHistoryPage() {
  const { id } = useParams()
  const [history, setHistory] = useState<Array<{ id: string, action: string, fromStatus: string, note: string, actorRole: string, actorName: string, createdAt: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!id) return
        const data = await listingsModerationApi.getHistory(id)
        setHistory(data)
      } catch (error) {
        console.error('Lỗi khi tải lịch sử kiểm duyệt', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full">
        <span className="material-symbols-outlined animate-spin text-[48px] text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full p-page-padding-mobile md:p-page-padding-desktop space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/kiem-duyet/hang-cho" className="font-label-md text-label-md text-primary flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quay lại hàng chờ
            </Link>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Lịch sử moderation</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">Nhật ký chi tiết các hành động kiểm duyệt đối với tin đăng này.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg bg-surface flex items-center justify-center gap-2 text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất báo cáo
          </button>
          <button className="h-10 px-4 rounded-lg bg-surface flex items-center justify-center gap-2 text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Lọc kết quả
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm overflow-hidden flex flex-col p-6 w-full max-w-4xl">
        <div className="relative w-full pl-6">
          <div className="absolute left-[39px] top-4 bottom-4 w-px bg-surface-container-highest"></div>
          
          <div className="flex flex-col gap-8 w-full relative">
            {history.map((item, index) => {
              const isReject = item.action === 'REJECTED'
              const isUpdate = item.action === 'UPDATED'
              const isApprove = item.action === 'APPROVED'
              const isHidden = item.action === 'HIDDEN'
              
              const icon = isReject ? 'block' : isUpdate ? 'edit' : isApprove ? 'check_circle' : 'visibility_off'
              const iconBg = isReject ? 'bg-error-container text-on-error-container' : isUpdate ? 'bg-secondary-container text-on-secondary-container' : isApprove ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-variant text-on-surface-variant'

              return (
                <div key={item.id} className="flex gap-6 relative w-full group">
                  <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${iconBg} flex items-center justify-center mt-1 shadow-sm ring-4 ring-surface`}>
                    <span className="material-symbols-outlined text-[16px] font-bold">{icon}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 min-w-0 bg-surface-container-lowest p-5 rounded-xl shadow-sm transition-transform duration-200 hover:-translate-y-1 border border-surface-container-low">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-label-md text-label-md text-on-surface truncate max-w-[200px]">
                            {isReject ? 'Đã từ chối tin đăng' : isUpdate ? 'Cập nhật thông tin phòng' : isApprove ? 'Đã phê duyệt tin đăng' : 'Đã ẩn tin đăng'}
                          </span>
                          
                          <span className="text-on-surface-variant text-[11px] font-mono whitespace-nowrap bg-surface-container px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span>
                            {item.fromStatus}
                          </span>
                          <span className="material-symbols-outlined text-outline-variant text-[14px]">arrow_forward</span>
                          
                          {isApprove ? (
                            <span className="text-on-surface-variant text-[11px] font-mono whitespace-nowrap bg-tertiary-container/20 text-tertiary px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                              Đang hiển thị
                            </span>
                          ) : isReject || isHidden ? (
                            <span className="text-on-surface-variant text-[11px] font-mono whitespace-nowrap bg-error-container/50 text-on-error-container px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                              Bị từ chối
                            </span>
                          ) : (
                            <span className="text-on-surface-variant text-[11px] font-mono whitespace-nowrap bg-surface-container px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-warning"></span>
                              Chờ duyệt lại
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {item.actorRole === 'Tenant' ? (
                            <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface">
                              {item.actorName.substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                              SA
                            </div>
                          )}
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{item.actorName}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums">{format(new Date(item.createdAt), 'dd/MM/yyyy')}</span>
                        <span className="text-[11px] text-on-surface-variant tabular-nums">{format(new Date(item.createdAt), 'HH:mm')}</span>
                      </div>
                    </div>

                    {item.note && isReject && (
                      <div className="bg-surface-container rounded-lg p-3 mt-1">
                        <div className="flex gap-2">
                          <span className="material-symbols-outlined text-[16px] text-error mt-0.5 flex-shrink-0">info</span>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">Lý do:</p>
                            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{item.note}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {item.note && !isReject && (
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 italic">{item.note}</p>
                    )}

                    {index === history.length - 1 && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                        <span className="font-label-sm text-label-sm text-tertiary">Trạng thái hiện tại</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
