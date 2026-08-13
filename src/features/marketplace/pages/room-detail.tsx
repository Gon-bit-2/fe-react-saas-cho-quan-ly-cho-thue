import { useParams, Link } from 'react-router'
import { useState } from 'react'
import { useMarketplaceRoom } from '@/shared/api/marketplace'


import { useAuth } from '@/shared/hooks/use-auth'
import { BookViewingDrawer } from '../components/book-viewing-drawer'
import { RentalRequestDrawer } from '../components/rental-request-drawer'

export function Component() {
  const { roomId } = useParams()
  const id = Number(roomId)
  const isValidRoomId = Number.isInteger(id) && id > 0
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'

  const { data, isLoading, isError, refetch } = useMarketplaceRoom(id)

  const [isViewingOpen, setIsViewingOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

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
            <h1 className="font-headline-lg text-text-main mb-4">{room.title}</h1>
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
                <p className="font-headline-sm text-text-main">{room.area !== null ? `${room.area}m²` : 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="font-label-sm text-on-surface-variant mb-1 uppercase">Sức chứa</p>
                <p className="font-headline-sm text-text-main">Tối đa {room.maxOccupants} người</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border-surface-border rounded-2xl border p-6 shadow-sm">
            <h2 className="font-headline-sm text-text-main mb-4">Tiện ích</h2>
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
          </section>
        </div>

        {/* Sidebar / CTA */}
        <aside className="w-full flex-shrink-0 md:w-80">
          <div className="bg-surface-container-lowest border-surface-border sticky top-[calc(var(--spacing-topbar-height)+24px)] rounded-2xl border p-6 shadow-sm">
            <div className="border-surface-border mb-6 flex items-center gap-4 border-b pb-6">
              <div className="bg-primary-container text-primary font-headline-sm flex h-12 w-12 items-center justify-center rounded-full">
                {room.property.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-label-md text-text-main">{room.property.name}</h3>
                <p className="font-label-sm text-on-surface-variant">Chủ nhà / Quản lý</p>
              </div>
            </div>

            <div className="space-y-4">
              {!isAuthenticated ? (
                <Link to={`/dang-nhap?returnUrl=/phong/${id}`} className="flex w-full">
                  <button className="bg-primary text-on-primary font-label-md w-full rounded-lg py-3 shadow-sm transition-opacity hover:opacity-90">
                    Đăng nhập để liên hệ
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setIsViewingOpen(true)}
                    className="bg-surface text-primary border-primary font-label-md hover:bg-primary/5 w-full rounded-lg border py-3 transition-colors"
                  >
                    Đặt lịch xem phòng
                  </button>
                  <button
                    onClick={() => setIsRequestOpen(true)}
                    className="bg-primary text-on-primary font-label-md w-full rounded-lg py-3 shadow-sm transition-opacity hover:opacity-90"
                  >
                    Gửi yêu cầu thuê
                  </button>
                </>
              )}
            </div>
            <p className="font-label-sm text-on-surface-variant mt-4 text-center">
              Bạn không phải trả phí khi sử dụng dịch vụ đặt lịch và yêu cầu thuê.
            </p>
          </div>
        </aside>
      </div>

      {/* Drawers */}
      <BookViewingDrawer isOpen={isViewingOpen} onClose={() => setIsViewingOpen(false)} roomId={id} />
      <RentalRequestDrawer isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} roomId={id} />
    </div>
  )
}
