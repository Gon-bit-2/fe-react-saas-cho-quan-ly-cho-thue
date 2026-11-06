import { useParams, Link } from 'react-router'
import { useState, useEffect } from 'react'
import {
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  AlertTriangle,
  Star,
  Maximize2,
  Users,
  CheckCircle2,
  Image as ImageIcon,
  Building,
  Shield,
} from 'lucide-react'
import { useMarketplaceRoom, useRecordView } from '@/shared/api/marketplace'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Trang chi tiết phòng trọ / căn hộ cho thuê - Marketplace.
 * Áp dụng Shadcn UI (Card, Tabs, Button, Badge, Separator) và thiết kế chuẩn DESIGN.md.
 */
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

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
        <h1 className="font-heading text-xl font-bold text-slate-900">Đường dẫn phòng không hợp lệ</h1>
        <Button asChild>
          <Link to="/phong">Xem danh sách phòng</Link>
        </Button>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-40 text-center">
        <h1 className="font-heading text-xl font-bold text-slate-900">Không thể tải thông tin phòng</h1>
        <p className="text-sm text-slate-500">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
        <Button onClick={() => void refetch()}>Thử lại</Button>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="font-medium text-slate-500">Không tìm thấy thông tin phòng</div>
      </div>
    )
  }

  // Định dạng số tiền chính xác theo DESIGN.md (1.250.000 ₫)
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(room.basePrice)

  const propertyType = room.property.type ? room.property.type.replaceAll('_', ' ') : 'Chưa phân loại'
  const location = [room.property.addressDetail, room.property.ward, room.property.district, room.property.province]
    .filter(Boolean)
    .join(', ')

  /**
   * Mở hoặc khởi tạo cuộc hội thoại chat liên quan tới phòng
   */
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

  const activeImage = room.images[selectedImageIndex]?.url || room.images[0]?.url || 'https://placehold.co/1200x800/png'

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-12">
      {/* Gallery Section */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto max-w-[1440px] py-6">
          <div className="grid grid-cols-1 gap-4 lg:h-[480px] lg:grid-cols-4">
            {/* Ảnh chính lớn */}
            <div className="group relative h-[320px] overflow-hidden rounded-2xl bg-slate-100 shadow-sm lg:col-span-3 lg:h-full">
              <img
                src={activeImage}
                alt={room.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/90 font-medium text-slate-800 shadow-xs backdrop-blur-md"
                >
                  <Building className="mr-1 size-3" />
                  {propertyType}
                </Badge>
                <Badge variant="default" className="bg-primary/90 backdrop-blur-md">
                  Mã: {room.roomCode}
                </Badge>
              </div>
            </div>

            {/* Danh sách ảnh thu nhỏ cạnh bên */}
            <div className="hidden h-full flex-col gap-3 overflow-y-auto pr-1 lg:flex">
              {room.images.length > 0 ? (
                room.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative flex-1 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-primary shadow-sm'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Ảnh ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <ImageIcon className="mb-2 size-8" />
                  <span className="text-xs">Không có ảnh thêm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Summary */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto flex max-w-[1440px] flex-col gap-8 py-8 lg:flex-row">
        {/* Left Column: Room Details with Tabs */}
        <div className="flex-1 space-y-6">
          {/* Header Card */}
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-2xl leading-tight font-bold text-slate-900 lg:text-3xl">
                  {room.title}
                </h1>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="text-primary size-4 shrink-0" />
                {location || 'Chưa cập nhật địa chỉ'}
              </p>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              {/* Quick specs grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="mb-1 block text-xs font-medium text-slate-500 uppercase">Mức giá thuê</span>
                  <span className="font-display text-primary text-xl font-bold">{formattedPrice}</span>
                  <span className="block text-xs text-slate-500">/tháng</span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="mb-1 block text-xs font-medium text-slate-500 uppercase">Tiền cọc</span>
                  <span className="font-heading text-lg font-semibold text-slate-800">
                    {room.depositAmount !== null
                      ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          maximumFractionDigits: 0,
                        }).format(room.depositAmount)
                      : 'Không yêu cầu'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="mb-1 block flex items-center gap-1 text-xs font-medium text-slate-500 uppercase">
                    <Maximize2 className="size-3 text-slate-500" />
                    Diện tích
                  </span>
                  <span className="font-heading text-lg font-semibold text-slate-800">
                    {room.area !== null ? `${room.area} m²` : 'Chưa rõ'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <span className="mb-1 block flex items-center gap-1 text-xs font-medium text-slate-500 uppercase">
                    <Users className="size-3 text-slate-500" />
                    Sức chứa
                  </span>
                  <span className="font-heading text-lg font-semibold text-slate-800">
                    Tối đa {room.maxOccupants} người
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content: Thông tin chi tiết, Tiện ích, Vị trí, Đánh giá */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 w-full justify-start rounded-xl bg-slate-200/60 p-1">
              <TabsTrigger value="overview" className="rounded-lg text-sm">
                Mô tả chi tiết
              </TabsTrigger>
              <TabsTrigger value="amenities" className="rounded-lg text-sm">
                Tiện ích ({room.amenities?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="location" className="rounded-lg text-sm">
                Vị trí & Bản đồ
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg text-sm">
                Đánh giá ({reviewSummary?.totalReviews ?? 0})
              </TabsTrigger>
            </TabsList>

            {/* Tab: Overview */}
            <TabsContent value="overview">
              <Card className="rounded-2xl border-slate-200/80">
                <CardHeader>
                  <CardTitle className="text-lg">Mô tả phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-slate-700">
                  {room.description ? (
                    <p className="whitespace-pre-line">{room.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có thông tin mô tả chi tiết cho phòng này.</p>
                  )}

                  {/* Chi phí dịch vụ khác */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="font-heading mb-3 text-sm font-semibold text-slate-900">
                      Chi phí sinh hoạt tham khảo:
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-600">Tiền điện:</span>
                        <span className="font-medium text-slate-900">
                          {room.electricityPrice
                            ? `${new Intl.NumberFormat('vi-VN').format(room.electricityPrice)} ₫/kWh`
                            : 'Theo giá nhà nước'}
                        </span>
                      </div>
                      <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-600">Tiền nước:</span>
                        <span className="font-medium text-slate-900">
                          {room.waterPrice
                            ? `${new Intl.NumberFormat('vi-VN').format(room.waterPrice)} ₫/khối`
                            : 'Theo giá nhà nước'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Amenities */}
            <TabsContent value="amenities">
              <Card className="rounded-2xl border-slate-200/80">
                <CardHeader>
                  <CardTitle className="text-lg">Trang bị tiện ích & Dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  {room.amenities && room.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {room.amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-800">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Chưa có thông tin tiện ích cho phòng này.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Location */}
            <TabsContent value="location">
              <Card className="rounded-2xl border-slate-200/80">
                <CardHeader>
                  <CardTitle className="text-lg">Vị trí thực tế</CardTitle>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="text-primary size-4" />
                    {room.property.name} - {room.property.addressDetail || location}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {room.property.latitude !== null &&
                    room.property.latitude !== undefined &&
                    room.property.longitude !== null &&
                    room.property.longitude !== undefined ? (
                      <GoongMap
                        latitude={room.property.latitude}
                        longitude={room.property.longitude}
                        className="h-72"
                      />
                    ) : (
                      <div className="h-72 w-full bg-slate-100">
                        <iframe
                          title="Bản đồ vị trí"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            [room.property.addressDetail, location].filter(Boolean).join(', '),
                          )}&output=embed`}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Reviews */}
            <TabsContent value="reviews">
              <Card className="rounded-2xl border-slate-200/80">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">Đánh giá từ khách thuê</CardTitle>
                    <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
                      <Star className="size-4 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold text-amber-900">
                        {Number(reviewSummary?.averageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-amber-700">({reviewSummary?.totalReviews ?? 0})</span>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReviewOpen(true)}
                      className="border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                    >
                      <Star className="size-3.5" />
                      Viết đánh giá
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews?.data?.length ? (
                      reviews.data.map((review) => (
                        <div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">
                              Khách thuê #{review.reviewerId}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Intl.DateTimeFormat('vi-VN').format(new Date(review.createdAt))}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-slate-700">
                            {review.comment || 'Khách thuê không để lại lời nhận xét cụ thể.'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-sm text-slate-500">
                        Phòng này chưa có đánh giá công khai nào.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Sticky Action & Host Summary Card */}
        <aside className="w-full flex-shrink-0 lg:w-88">
          <Card className="sticky top-[calc(var(--spacing-topbar-height)+24px)] rounded-2xl border-slate-200 shadow-md">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-lg font-bold">
                  {room.property.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-heading line-clamp-1 leading-tight font-semibold text-slate-900">
                    {room.property.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <Shield className="size-3 text-emerald-600" />
                    Chủ trọ đã xác thực danh tính
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="mb-1 block text-xs text-slate-500">Giá niêm yết</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-primary text-2xl font-bold">{formattedPrice}</span>
                  <span className="text-xs text-slate-500">/tháng</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                {!isAuthenticated ? (
                  <Button asChild size="lg" className="w-full rounded-xl">
                    <Link to={`/dang-nhap?returnUrl=/phong/${id}`}>Đăng nhập để đặt phòng</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setIsRequestOpen(true)}
                      className="w-full gap-2 rounded-xl font-medium shadow-sm"
                    >
                      <Send className="size-4" />
                      Gửi yêu cầu thuê phòng
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewingOpen(true)}
                        className="gap-1.5 rounded-xl border-slate-200"
                      >
                        <Calendar className="text-primary size-4" />
                        Đặt lịch xem
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleOpenChat}
                        className="gap-1.5 rounded-xl border-slate-200"
                      >
                        <MessageSquare className="size-4 text-blue-600" />
                        Nhắn tin
                      </Button>
                    </div>

                    <div className="pt-1">
                      <FavoriteButton roomId={room.id} withText={true} className="w-full" />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-1 text-center text-xs text-slate-500">
                Hoàn toàn miễn phí khi liên hệ và đặt lịch xem phòng trực tiếp.
              </div>

              <Separator />

              {/* Report button */}
              <div className="pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportOpen(true)}
                  className="text-muted-foreground hover:text-destructive w-full gap-1.5 text-xs"
                >
                  <AlertTriangle className="size-3.5" />
                  Báo cáo vi phạm hoặc tin giả
                </Button>
              </div>
            </CardContent>
          </Card>
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
