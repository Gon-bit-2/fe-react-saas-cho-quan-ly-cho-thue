import { Link } from 'react-router'
import type { MarketplaceRoom } from '../types'
import { FavoriteButton } from './favorite-button'

interface RoomCardProps {
  room: MarketplaceRoom
  variant?: 'default' | 'featured' | 'featured-large'
  badge?: 'new' | 'hot' | null
}

export function RoomCard({ room, variant = 'default', badge = null }: RoomCardProps) {
  const thumbnail = room.images.find((img) => img.isThumbnail) || room.images[0]

  // Format currency
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(room.basePrice)

  const renderBadge = () => {
    if (badge === 'new') {
      return (
        <div className="font-label-sm absolute top-4 left-4 z-10 rounded bg-emerald-600 px-2.5 py-1 font-medium text-white shadow-sm">
          Mới cập nhật
        </div>
      )
    }
    if (badge === 'hot') {
      return (
        <div className="font-label-sm absolute top-4 left-4 z-10 rounded bg-amber-500 px-2.5 py-1 font-medium text-white shadow-sm">
          Hot
        </div>
      )
    }
    return null
  }

  if (variant === 'featured-large') {
    return (
      <article className="group relative col-span-1 flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <Link to={`/phong/${room.id}`} className="absolute inset-0 z-20">
          <span className="sr-only">Xem chi tiết</span>
        </Link>
        <div className="relative min-h-[300px] w-full flex-1 overflow-hidden">
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/600x800/png'}')` }}
          />
          {renderBadge()}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>

        <div className="pointer-events-none relative z-30 flex flex-col justify-between bg-white p-6">
          <div>
            <p className="font-body-sm mb-2 flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {room.property.district}, {room.property.province}
            </p>

            <h3 className="font-headline-sm mb-4 line-clamp-2 leading-tight text-slate-900">{room.title}</h3>

            <div className="font-label-sm mb-6 flex flex-wrap gap-4 text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">aspect_ratio</span> {room.area} m²
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">bed</span> {room.maxOccupants} Giường
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="font-headline-sm text-primary">
              {formattedPrice}
              <span className="text-sm font-normal text-slate-500"> đ/tháng</span>
            </span>
            <FavoriteButton roomId={room.id} />
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="bg-surface-container-lowest group relative col-span-1 flex flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md md:col-span-2 md:flex-row lg:col-span-2">
        {/* code here was for the horizontal card, keeping it mostly intact just in case */}
        <div className="relative aspect-video h-full w-full overflow-hidden md:aspect-auto md:w-1/2">
          <div
            className="h-full min-h-[240px] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/600x400/png'}')` }}
          />
          {renderBadge()}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-surface-container-lowest/90 text-text-main font-label-sm flex items-center gap-1 rounded px-2 py-1 backdrop-blur">
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              {room.images.length}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col justify-between p-6 md:w-1/2">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <span className="font-label-sm text-primary tracking-wider uppercase">
                {room.property.type.replaceAll('_', ' ')}
              </span>
              <span className="font-headline-sm text-primary">
                {formattedPrice}
                <span className="text-on-surface-variant text-sm font-normal">/tháng</span>
              </span>
            </div>

            <Link to={`/phong/${room.id}`} className="group-hover:text-primary transition-colors">
              <h3 className="font-headline-sm text-text-main mb-2 line-clamp-2">{room.title}</h3>
            </Link>

            <p className="font-body-md text-on-surface-variant mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="line-clamp-1">
                {[room.property?.addressDetail, room.property?.ward, room.property?.district, room.property?.province]
                  .filter(Boolean)
                  .join(', ') || 'Chưa cập nhật địa chỉ'}
              </span>
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="bg-surface-container-low text-on-surface-variant font-label-sm inline-flex items-center gap-1 rounded px-2 py-1">
                <span className="material-symbols-outlined text-[14px]">aspect_ratio</span> {room.area}m²
              </span>
              <span className="bg-surface-container-low text-on-surface-variant font-label-sm inline-flex items-center gap-1 rounded px-2 py-1">
                <span className="material-symbols-outlined text-[14px]">group</span> Tối đa {room.maxOccupants}
              </span>
            </div>
          </div>

          <div className="border-surface-border flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary-container text-primary font-label-md flex h-8 w-8 items-center justify-center rounded-full">
                {room.property.name.charAt(0)}
              </div>
              <span className="font-label-md text-text-main line-clamp-1">{room.property.name}</span>
            </div>
            <Link
              to={`/phong/${room.id}`}
              className="font-label-md text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
            >
              Chi tiết <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // Default variant
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <Link to={`/phong/${room.id}`} className="absolute inset-0 z-20">
        <span className="sr-only">Xem chi tiết</span>
      </Link>

      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/400x300/png'}')` }}
        />
        {renderBadge()}
      </div>

      <div className="pointer-events-none relative z-30 flex flex-1 flex-col bg-white p-5">
        <p className="font-body-sm mb-2 flex items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="line-clamp-1">
            {[room.property?.addressDetail, room.property?.ward, room.property?.district, room.property?.province]
              .filter(Boolean)
              .join(', ') || 'Chưa cập nhật địa chỉ'}
          </span>
        </p>

        <h3 className="font-headline-sm mb-3 line-clamp-2 leading-snug text-slate-900">{room.title}</h3>

        <div className="font-label-sm mb-5 flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">aspect_ratio</span> {room.area} m²
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">group</span> {room.maxOccupants || '?'} người
          </span>
          {room.amenities.find((a) => a.name.toLowerCase().includes('ban công')) && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">balcony</span> Có ban công
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-headline-sm text-primary">
            {formattedPrice}
            <span className="text-sm font-normal text-slate-500"> đ/tháng</span>
          </span>
        </div>
      </div>
    </article>
  )
}
