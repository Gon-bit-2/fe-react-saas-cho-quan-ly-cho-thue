import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { format } from 'date-fns'
import { useAdminModerationRoom, useAdminUpdateModerationStatus } from '@/shared/api/admin'
import { toast } from 'sonner'
import type { TListingModerationStatus } from '@/shared/api/listings-moderation'

export function ModerationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: listing, isLoading: loading } = useAdminModerationRoom(Number(id))
  const updateStatus = useAdminUpdateModerationStatus(Number(id))
  
  const [showFeedback, setShowFeedback] = useState(false)
  const [reason, setReason] = useState('')

  const handleUpdateStatus = async (status: TListingModerationStatus) => {
    if ((status === 'REJECTED' || status === 'HIDDEN') && !showFeedback) {
      setShowFeedback(true)
      return
    }

    try {
      await updateStatus.mutateAsync({ status, note: reason })
      toast.success('Đã cập nhật trạng thái thành công!')
      navigate('/admin/kiem-duyet/hang-cho')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
      console.error('Lỗi cập nhật trạng thái', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] w-full">
        <span className="material-symbols-outlined animate-spin text-[48px] text-primary">progress_activity</span>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="flex flex-col w-full h-full pb-8 animate-in fade-in duration-500">
      <div className="max-w-[1440px] mx-auto p-page-padding-desktop w-full">
        <div className="flex flex-col xl:flex-row gap-6 w-full items-start">
          <div className="flex-1 w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="relative w-full h-[400px]">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${listing.images?.[0]?.url || ''}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary-fixed-dim font-label-sm rounded uppercase tracking-wider backdrop-blur-md">Phòng trọ</span>
                    <span className="px-2 py-1 bg-surface-container-lowest/80 text-on-surface font-label-sm rounded backdrop-blur-md">Tin mới</span>
                  </div>
                  <h1 className="font-headline-md text-on-surface mb-1 drop-shadow-md">{listing.title}</h1>
                  <p className="text-on-surface-variant font-body-md flex items-center gap-1 drop-shadow-md">
                    <span className="material-symbols-outlined text-[18px]">location_on</span> {listing.property?.address || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[20px] text-primary">photo_library</span>
                <span className="font-label-md text-on-surface">1/1</span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 flex flex-col gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-primary">{new Intl.NumberFormat('vi-VN').format(listing.basePrice)}</span>
                    <span className="font-body-lg text-on-surface-variant">VNĐ/tháng</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-surface-container-low px-4 py-3 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">aspect_ratio</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Diện tích</p>
                        <p className="font-label-md text-on-surface">{listing.area} m²</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-3 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">bed</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Tình trạng</p>
                        <p className="font-label-md text-on-surface">Trống</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-3 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">monetization_on</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Cọc</p>
                        <p className="font-label-md text-on-surface">1 tháng</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-3">Mô tả chi tiết</h3>
                    <div className="font-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                      {listing.description}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-3">Tiện ích</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                      {listing.amenities?.map((item: { amenity?: { name: string } }, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span className="font-body-md">{item.amenity?.name || 'Tiện ích'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-1 flex flex-col gap-6">
                  <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-4">
                    <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Thông tin chủ trọ</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        {(listing.property?.name || 'A').charAt(0)}
                      </div>
                      <div>
                        <p className="font-headline-sm text-on-surface">{listing.property?.name || listing.landlordName || 'Chủ trọ'}</p>
                        <div className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          <span className="font-label-sm">Đã xác thực</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-6 sticky top-20">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b5cf6]/10 rounded-bl-full blur-xl"></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-headline-sm text-on-surface">Bảng Kiểm Duyệt</h2>
                  <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">gavel</span> Moderation
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant">Phiên bản ID: <span className="font-mono text-xs">#LST-{id}</span></p>
              </div>

              <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-on-surface-variant">Người kiểm duyệt:</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-info"></span>
                    <span className="font-label-md text-on-surface">System Admin</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-on-surface-variant">Thời gian nộp:</span>
                  <span className="font-body-md text-on-surface">
                    {format(new Date(listing.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-on-surface-variant">Điểm tin cậy (AI):</span>
                  <span className="font-label-md text-tertiary">92/100 (Cao)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={submitting}
                  className="w-full py-3 bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container hover:text-on-tertiary-fixed font-label-md rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Phê duyệt tin đăng
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-surface-container-lowest hover:bg-error-container text-error font-label-md rounded-lg flex items-center justify-center gap-2 transition-colors border border-outline-variant hover:border-error shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    Từ chối
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('HIDDEN')}
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md rounded-lg flex items-center justify-center gap-2 transition-colors border border-outline-variant shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    Ẩn tin
                  </button>
                </div>
              </div>

              {showFeedback && (
                <div className="flex flex-col gap-2 mt-2 transition-all duration-300 origin-top">
                  <label className="font-label-md text-on-surface">Lý do từ chối / ẩn tin <span className="text-error">*</span></label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] min-h-[100px] resize-none placeholder:text-on-surface-variant/50" 
                    placeholder="Nhập lý do chi tiết để chủ trọ có thể khắc phục..."
                  ></textarea>
                  <div className="flex items-start gap-1.5 text-[#8b5cf6] mt-1">
                    <span className="material-symbols-outlined text-[16px] pt-0.5">info</span>
                    <p className="font-label-sm leading-tight">Lý do này sẽ được gửi trực tiếp đến chủ trọ qua email và thông báo trong ứng dụng.</p>
                  </div>
                  <button 
                    onClick={() => handleUpdateStatus(showFeedback ? (reason ? 'REJECTED' : 'PENDING') : 'PENDING')}
                    disabled={!reason || submitting}
                    className="mt-2 w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-label-md rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận & Gửi'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Lịch sử kiểm duyệt</h3>
              <div className="relative border-l border-outline-variant ml-3 pl-6 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-primary-container w-[14px] h-[14px] rounded-full ring-4 ring-surface-container-lowest"></div>
                  <p className="font-label-sm text-on-surface-variant mb-1">
                    {format(new Date(listing.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p className="font-label-md text-on-surface">Chủ trọ gửi yêu cầu duyệt tin</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-surface-container-high w-[14px] h-[14px] rounded-full ring-4 ring-surface-container-lowest"></div>
                  <p className="font-label-sm text-on-surface-variant mb-1">
                    {format(new Date(new Date(listing.createdAt || new Date()).getTime() - 24 * 60 * 60 * 1000), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p className="font-label-md text-on-surface">Tin đăng được lưu nháp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
