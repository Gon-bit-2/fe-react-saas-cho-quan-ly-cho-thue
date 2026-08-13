import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { format } from 'date-fns'
import { useAdminModerationRoom, useAdminUpdateModerationStatus } from '@/shared/api/admin'
import { toast } from 'sonner'

export function ModerationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: listing, isLoading: loading } = useAdminModerationRoom(Number(id))
  const updateStatus = useAdminUpdateModerationStatus(Number(id))

  const [showFeedback, setShowFeedback] = useState(false)
  const [reason, setReason] = useState('')
  const [intendedStatus, setIntendedStatus] = useState<'APPROVED' | 'REJECTED' | 'HIDDEN' | null>(null)
  const submitting = updateStatus.isPending

  /**
   * Xử lý cập nhật trạng thái kiểm duyệt phòng trọ lên máy chủ.
   * Nếu trạng thái là từ chối (REJECTED) hoặc ẩn tin (HIDDEN), hệ thống yêu cầu nhập lý do.
   * Khi trạng thái là phê duyệt (PUBLISHED), thuộc tính reason sẽ không được đính kèm vào payload
   * để tránh lỗi Zod validation ở backend (do Zod bắt buộc min 3 ký tự nếu gửi chuỗi rỗng).
   * Đồng thời thực hiện chuyển hướng người dùng khi cập nhật trạng thái thành công.
   * 
   * @param status Trạng thái kiểm duyệt đích từ giao diện kiểm duyệt ('APPROVED' | 'REJECTED' | 'HIDDEN').
   */
  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    if ((status === 'REJECTED' || status === 'HIDDEN') && !showFeedback) {
      setIntendedStatus(status)
      setShowFeedback(true)
      return
    }

    try {
      const marketplaceStatus = (status === 'APPROVED' ? 'PUBLISHED' : status) as 'PUBLISHED' | 'REJECTED' | 'HIDDEN'
      
      // Chuẩn bị dữ liệu gửi lên backend: Chỉ đính kèm reason khi không phải là PUBLISHED và reason có giá trị
      const payload: { marketplaceStatus: 'PUBLISHED' | 'REJECTED' | 'HIDDEN'; reason?: string } = {
        marketplaceStatus,
      }
      if (marketplaceStatus !== 'PUBLISHED' && reason) {
        payload.reason = reason
      }

      await updateStatus.mutateAsync(payload)
      toast.success('Đã cập nhật trạng thái thành công!')
      navigate('/admin/kiem-duyet/hang-cho')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
      console.error('Lỗi cập nhật trạng thái', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin text-[48px]">progress_activity</span>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="animate-in fade-in flex h-full w-full flex-col pb-8 duration-500">
      <div className="p-page-padding-desktop mx-auto w-full max-w-[1440px]">
        <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
          <div className="bg-surface-container-lowest flex w-full flex-1 flex-col overflow-hidden rounded-xl shadow-sm">
            <div className="relative h-[400px] w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${listing.images?.[0]?.url || ''}')` }}
              ></div>
              <div className="from-background/90 absolute inset-0 bg-gradient-to-t to-transparent"></div>
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="bg-primary/20 text-primary-fixed-dim font-label-sm rounded px-2 py-1 tracking-wider uppercase backdrop-blur-md">
                      Phòng trọ
                    </span>
                    <span className="bg-surface-container-lowest/80 text-on-surface font-label-sm rounded px-2 py-1 backdrop-blur-md">
                      Tin mới
                    </span>
                  </div>
                  <h1 className="font-headline-md text-on-surface mb-1 drop-shadow-md">{listing.title}</h1>
                  <p className="text-on-surface-variant font-body-md flex items-center gap-1 drop-shadow-md">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>{' '}
                    {listing.property?.addressDetail || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-lowest/90 absolute top-4 right-4 flex items-center gap-2 rounded-lg px-3 py-1.5 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-primary text-[20px]">photo_library</span>
                <span className="font-label-md text-on-surface">1/1</span>
              </div>
            </div>

            <div className="flex flex-col gap-8 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-2 flex flex-col gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-primary">
                      {new Intl.NumberFormat('vi-VN').format(listing.basePrice)}
                    </span>
                    <span className="font-body-lg text-on-surface-variant">VNĐ/tháng</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-surface-container-low flex items-center gap-3 rounded-lg px-4 py-3">
                      <span className="material-symbols-outlined text-on-surface-variant">aspect_ratio</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Diện tích</p>
                        <p className="font-label-md text-on-surface">{listing.area} m²</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low flex items-center gap-3 rounded-lg px-4 py-3">
                      <span className="material-symbols-outlined text-on-surface-variant">bed</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Tình trạng</p>
                        <p className="font-label-md text-on-surface">Trống</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low flex items-center gap-3 rounded-lg px-4 py-3">
                      <span className="material-symbols-outlined text-on-surface-variant">monetization_on</span>
                      <div>
                        <p className="font-label-sm text-on-surface-variant">Cọc</p>
                        <p className="font-label-md text-on-surface">1 tháng</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-3">Mô tả chi tiết</h3>
                    <div className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-3">Tiện ích</h3>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3">
                      {listing.amenities?.map((item: { amenity?: { name: string } }, i: number) => (
                        <div key={i} className="text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span className="font-body-md">{item.amenity?.name || 'Tiện ích'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-1 flex flex-col gap-6">
                  <div className="bg-surface-container-low flex flex-col gap-4 rounded-xl p-4">
                    <h3 className="font-label-md text-on-surface-variant tracking-wider uppercase">
                      Thông tin chủ trọ
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-container text-on-primary-container flex h-12 w-12 items-center justify-center rounded-full font-bold">
                        {(listing.property?.name || 'A').charAt(0)}
                      </div>
                      <div>
                        <p className="font-headline-sm text-on-surface">
                          {listing.property?.name || listing.landlordName || 'Chủ trọ'}
                        </p>
                        <div className="text-primary flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                          <span className="font-label-sm">Đã xác thực</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky top-20 flex w-full shrink-0 flex-col gap-6 xl:w-[380px]">
            <div className="bg-surface-container-lowest relative flex flex-col gap-6 overflow-hidden rounded-xl p-6 shadow-sm">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-[#8b5cf6]/10 blur-xl"></div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-headline-sm text-on-surface">Bảng Kiểm Duyệt</h2>
                  <span className="font-label-sm flex items-center gap-1 rounded bg-[#8b5cf6]/10 px-2 py-1 text-[#8b5cf6]">
                    <span className="material-symbols-outlined text-[14px]">gavel</span> Moderation
                  </span>
                </div>
                <p className="font-body-md text-on-surface-variant">
                  Phiên bản ID: <span className="font-mono text-xs">#LST-{id}</span>
                </p>
              </div>

              <div className="bg-surface-container flex flex-col gap-3 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Người kiểm duyệt:</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-status-info h-2 w-2 rounded-full"></span>
                    <span className="font-label-md text-on-surface">System Admin</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Thời gian nộp:</span>
                  <span className="font-body-md text-on-surface">
                    {format(new Date(listing.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-on-surface-variant">Điểm tin cậy (AI):</span>
                  <span className="font-label-md text-tertiary">92/100 (Cao)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={submitting}
                  className="bg-tertiary-container hover:bg-tertiary-fixed text-on-tertiary-container hover:text-on-tertiary-fixed font-label-md flex w-full items-center justify-center gap-2 rounded-lg py-3 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Phê duyệt tin đăng
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={submitting}
                    className="bg-surface-container-lowest hover:bg-error-container text-error font-label-md border-outline-variant hover:border-error flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('HIDDEN')}
                    disabled={submitting}
                    className="bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-label-md border-outline-variant flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                    Ẩn tin
                  </button>
                </div>
              </div>

              {showFeedback && (
                <div className="mt-2 flex origin-top flex-col gap-2 transition-all duration-300">
                  <label className="font-label-md text-on-surface">
                    Lý do từ chối / ẩn tin <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-surface-container-lowest border-outline-variant font-body-md text-on-surface placeholder:text-on-surface-variant/50 min-h-[100px] w-full resize-none rounded-lg border p-3 focus:ring-2 focus:ring-[#8b5cf6] focus:outline-none"
                    placeholder="Nhập lý do chi tiết để chủ trọ có thể khắc phục..."
                  ></textarea>
                  <div className="mt-1 flex items-start gap-1.5 text-[#8b5cf6]">
                    <span className="material-symbols-outlined pt-0.5 text-[16px]">info</span>
                    <p className="font-label-sm leading-tight">
                      Lý do này sẽ được gửi trực tiếp đến chủ trọ qua email và thông báo trong ứng dụng.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (intendedStatus) {
                        handleUpdateStatus(intendedStatus)
                      }
                    }}
                    disabled={!reason || submitting}
                    className="font-label-md mt-2 w-full rounded-lg bg-[#8b5cf6] py-2 text-white shadow-sm transition-colors hover:bg-[#7c3aed] disabled:opacity-50"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận & Gửi'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h3 className="font-label-md text-on-surface-variant mb-4 tracking-wider uppercase">
                Lịch sử kiểm duyệt
              </h3>
              <div className="border-outline-variant relative ml-3 flex flex-col gap-6 border-l pl-6">
                <div className="relative">
                  <div className="bg-primary-container ring-surface-container-lowest absolute -left-[31px] h-[14px] w-[14px] rounded-full ring-4"></div>
                  <p className="font-label-sm text-on-surface-variant mb-1">
                    {format(new Date(listing.createdAt || new Date()), 'dd/MM/yyyy HH:mm')}
                  </p>
                  <p className="font-label-md text-on-surface">Chủ trọ gửi yêu cầu duyệt tin</p>
                </div>
                <div className="relative">
                  <div className="bg-surface-container-high ring-surface-container-lowest absolute -left-[31px] h-[14px] w-[14px] rounded-full ring-4"></div>
                  <p className="font-label-sm text-on-surface-variant mb-1">
                    {format(
                      new Date(new Date(listing.createdAt || new Date()).getTime() - 24 * 60 * 60 * 1000),
                      'dd/MM/yyyy HH:mm',
                    )}
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
