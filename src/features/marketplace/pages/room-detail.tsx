import { useParams, Link } from 'react-router'
import { useState } from 'react'
import { AlertTriangle, Star } from 'lucide-react'
import { useMarketplaceRoom, useRecordView } from '@/shared/api/marketplace'
import { useEffect } from 'react'

import { useAuth } from '@/shared/hooks/use-auth'
import { toast } from 'sonner'
import { conversationsApi } from '@/shared/api/conversations'
import { BookViewingDrawer } from '../components/book-viewing-drawer'
import { RentalRequestDrawer } from '../components/rental-request-drawer'
import { FavoriteButton } from '../components/favorite-button'
import { GoongMap } from '@/shared/components/goong-map'
import {
  useReviewsPublicControllerGetSummary,
  useReviewsPublicControllerListPublic,
} from '@/shared/api/generated/reviews-public/reviews-public'
import { ReviewModal } from '../components/review-modal'
import { ReportModal } from '../components/report-modal'

export function Component() {
  const { roomId } = useParams()
  const id = Number(roomId)
  const isValidRoomId = Number.isInteger(id) && id > 0
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'

  const { data, isLoading, isError, refetch } = useMarketplaceRoom(id)
  const { data: reviewSummary, refetch: refetchSummary } = useReviewsPublicControllerGetSummary(id, {
    query: { enabled: isValidRoomId },
  })
  const { data: reviews, refetch: refetchReviews } = useReviewsPublicControllerListPublic(
    id,
    { page: 1, limit: 5 },
    { query: { enabled: isValidRoomId } },
  )

  const recordViewMutation = useRecordView()

  useEffect(() => {
    if (isValidRoomId) {
      const timer = setTimeout(() => {
        recordViewMutation.mutate(id)
      }, 2000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidRoomId, id])

  const [isViewingOpen, setIsViewingOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const room = data

  if (!isValidRoomId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-40 text-center">
        <h1 className="font-headline-sm text-text-main">Đường dẫn phòng không hợp lệ</h1>
        <Link to="/phong" className="bg-primary text-on-primary rounded-lg px-4 py-2 font-medium">
          Xem danh sách phòng
        </Link>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-40 text-center">
        <h1 className="font-headline-sm text-text-main">Không thể tải thông tin phòng</h1>
        <p className="font-body-md text-on-surface-variant">Vui lòng kiểm tra kết nối và thử lại.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="bg-primary text-on-primary rounded-lg px-4 py-2 font-medium"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-on-surface-variant font-body-lg">Không tìm thấy thông tin phòng</div>
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(room.basePrice)
  const propertyType = room.property.type ? room.property.type.replaceAll('_', ' ') : 'Chưa phân loại'
  const location = [room.property.ward, room.property.district, room.property.province].filter(Boolean).join(', ')

  const handleOpenChat = async () => {
    try {
      const conv = await conversationsApi.findOrCreateConversation({
        type: 'ROOM_CHAT',
        tenantId: room.tenantId,
        roomId: room.id,
      })
      window.dispatchEvent(new CustomEvent('open-chat', { detail: { conversationId: conv.id } }))
    } catch (e) {
      toast.error('Không thể tạo cuộc trò chuyện')
      console.error(e)
    }
  }

  return (
    <div className="bg-surface-container-low min-h-screen pb-20 md:pb-8">
      {/* Gallery Section */}
      <div className="bg-surface-container-lowest">
        <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto max-w-[1440px] py-6">
          <div className="grid grid-cols-1 gap-4 md:h-[500px] md:grid-cols-4">
            {/* Main Image */}
            <div className="relative h-[300px] overflow-hidden rounded-2xl md:col-span-3 md:h-full">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${room.images[0]?.url || 'https://placehold.co/1200x800/png'}')` }}
              />
              <div className="bg-surface-container-lowest/90 text-text-main font-label-md absolute top-4 left-4 rounded-lg px-3 py-1.5 shadow-sm backdrop-blur">
                {propertyType}
              </div>
            </div>

            {/* Side Images */}
            <div className="hidden h-full flex-col gap-4 md:flex">
              {room.images.slice(1, 3).map((img, idx) => (
                <div key={img.id || idx} className="relative flex-1 overflow-hidden rounded-2xl">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${img.url}')` }} />
                </div>
              ))}
              {room.images.length <= 1 && (
                <div className="bg-surface-container text-on-surface-variant flex flex-1 items-center justify-center rounded-2xl">
                  <span className="material-symbols-outlined text-4xl">image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto flex max-w-[1440px] flex-col gap-8 py-8 md:flex-row">
        {/* Main Info */}
        <div className="flex-1 space-y-8">
          <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="font-headline-lg text-text-main">{room.title}</h1>
              <FavoriteButton roomId={room.id} className="flex-shrink-0" />
            </div>
            <p className="font-body-md text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              {location || 'Chưa cập nhật khu vực'}
            </p>

            <div className="border-surface-border flex flex-wrap gap-6 border-y py-6">
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1 uppercase">Mức giá</p>
                <p className="font-headline-sm text-primary">{formattedPrice}/tháng</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1 uppercase">Tiền cọc</p>
                <p className="font-headline-sm text-text-main">
                  {room.depositAmount !== null
                    ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      }).format(room.depositAmount)
                    : 'Không yêu cầu'}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1 uppercase">Diện tích</p>
                <p className="font-headline-sm text-text-main">
                  {room.area !== null ? `${room.area}m²` : 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1 uppercase">Sức chứa</p>
                <p className="font-headline-sm text-text-main">Tối đa {room.maxOccupants} người</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
            <h2 className="font-headline-sm text-text-main mb-4">Tiện ích</h2>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {room.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-3">
                    <div className="bg-secondary-container text-secondary flex h-10 w-10 items-center justify-center rounded-full">
                      <span className="material-symbols-outlined">{amenity.icon || 'check'}</span>
                    </div>
                    <span className="font-body-md text-on-surface">{amenity.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body-md text-on-surface-variant italic">Chưa có thông tin tiện ích cho phòng này.</p>
            )}
          </section>

          <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
            <h2 className="font-headline-sm text-text-main mb-4">Mô tả chi tiết</h2>
            <div className="prose prose-slate max-w-none">
              {room.description ? (
                <p className="font-body-md text-on-surface whitespace-pre-line">{room.description}</p>
              ) : (
                <p className="font-body-md text-on-surface-variant italic">Chưa có mô tả chi tiết cho phòng này.</p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
              <h2 className="font-headline-sm text-text-main mb-4">Vị trí</h2>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[20px]">
                  location_on
                </span>
                <div>
                  <p className="font-label-lg text-text-main">{room.property?.name}</p>
                  <p className="font-body-md text-on-surface-variant mt-1">{room.property.addressDetail || location}</p>
                </div>
              </div>
              <div className="mt-4">
                {room.property.latitude !== null &&
                room.property.latitude !== undefined &&
                room.property.longitude !== null &&
                room.property.longitude !== undefined ? (
                  <GoongMap latitude={room.property.latitude} longitude={room.property.longitude} className="h-48" />
                ) : (
                  <div className="bg-surface-container h-48 overflow-hidden rounded-xl">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        [room.property.addressDetail, location].filter(Boolean).join(', '),
                      )}&output=embed`}
                    ></iframe>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-text-main">Đánh giá</h2>
                  <div className="font-label-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-yellow-400">star</span>
                    <span className="text-text-main">{Number(reviewSummary?.averageRating || 0).toFixed(1)}</span>
                    <span className="text-on-surface-variant font-body-md">
                      ({reviewSummary?.totalReviews ?? 0} đánh giá)
                    </span>
                  </div>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setIsReviewOpen(true)}
                    className="bg-surface-container text-primary hover:bg-surface-container-high flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    Viết đánh giá
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {reviews?.data?.length ? (
                  reviews.data.map((review) => (
                    <div key={review.id} className="bg-surface-container-low rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-label-md text-text-main">Người thuê #{review.reviewerId}</p>
                        <p className="font-body-sm text-on-surface-variant">
                          {new Intl.DateTimeFormat('vi-VN').format(new Date(review.createdAt))}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-[14px] ${star <= review.rating ? 'text-yellow-400' : 'text-surface-variant'}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className="font-body-md text-on-surface mt-2">
                        {review.comment || 'Người thuê không để lại nhận xét.'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="font-body-md text-on-surface-variant">Phòng chưa có đánh giá đã được duyệt.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar / CTA */}
        <aside className="w-full flex-shrink-0 md:w-80">
          <div className="bg-surface-container-lowest border-surface-border sticky top-[calc(var(--spacing-topbar-height)+24px)] rounded-2xl border p-5 shadow-sm">
            <h2 className="font-headline-sm text-text-main mb-4">Đăng bởi</h2>
            
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary-container text-primary font-headline-sm flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full">
                {room.property.name.charAt(0)}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-headline-sm text-text-main leading-tight">{room.property.name}</h3>
                {room.publishedAt && (
                  <div className="bg-surface-container-low mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
                    <div className="bg-surface-variant h-1.5 w-1.5 rounded-full"></div>
                    <span className="font-body-sm text-on-surface-variant">
                      Đăng lúc {new Intl.DateTimeFormat('vi-VN').format(new Date(room.publishedAt))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 space-y-1">
              {room.createdAt && (
                <p className="font-body-md text-on-surface">
                  <span className="font-medium text-text-main">Tham gia: </span>
                  từ {new Intl.DateTimeFormat('vi-VN', { month: 'numeric', year: 'numeric' }).format(new Date(room.createdAt))}
                </p>
              )}
              <p className="font-body-md text-on-surface">
                <span className="font-medium text-text-main">Khu vực: </span>
                {room.property.district || room.property.province || 'Đang cập nhật'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {!isAuthenticated ? (
                <Link to={`/dang-nhap?returnUrl=/phong/${id}`} className="flex w-full">
                  <button className="bg-primary text-on-primary font-label-md w-full rounded-full px-4 py-2.5 shadow-sm transition-opacity hover:opacity-90">
                    Đăng nhập để liên hệ
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsRequestOpen(true)}
                    className="bg-primary text-on-primary font-label-md flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 shadow-sm transition-opacity hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Gửi yêu cầu thuê
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsViewingOpen(true)}
                      className="bg-surface-container text-on-surface font-label-md hover:bg-surface-container-high flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 transition-colors border border-surface-border"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      Đặt lịch xem
                    </button>
                    <button
                      onClick={handleOpenChat}
                      className="bg-secondary-container text-on-secondary-container font-label-md hover:bg-secondary-container/80 flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 transition-colors border border-surface-border"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Chat
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <p className="font-label-sm text-on-surface-variant mt-4 text-center">
              Bạn không phải trả phí khi đặt lịch và yêu cầu thuê.
            </p>

            <div className="border-surface-border mt-5 border-t pt-4">
              <button
                onClick={() => setIsReportOpen(true)}
                className="text-on-surface-variant hover:text-destructive flex w-full items-center justify-center gap-2 text-sm transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                Báo cáo vi phạm
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Drawers */}
      <BookViewingDrawer isOpen={isViewingOpen} onClose={() => setIsViewingOpen(false)} roomId={id} />
      <RentalRequestDrawer isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} roomId={id} />

      {/* Modals */}
      <ReviewModal
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        roomId={id}
        onSuccess={() => {
          refetchReviews()
          refetchSummary()
        }}
      />
      <ReportModal open={isReportOpen} onOpenChange={setIsReportOpen} targetId={id} targetType="ROOM" />
    </div>
  )
}
