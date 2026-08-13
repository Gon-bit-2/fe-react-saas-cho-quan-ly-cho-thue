import { Link } from 'react-router'
import type { MarketplaceRoom } from '../types'

interface RoomCardProps {
  room: MarketplaceRoom
  variant?: 'default' | 'featured' | 'featured-large'
  badge?: 'new' | 'hot' | null
}

export function RoomCard({ room, variant = 'default', badge = null }: RoomCardProps) {
  const thumbnail = room.images.find(img => img.isThumbnail) || room.images[0]
  
  // Format currency
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(room.basePrice)

  const renderBadge = () => {
    if (badge === 'new') {
      return (
        <div className="absolute top-4 left-4 bg-emerald-600 text-white px-2.5 py-1 rounded shadow-sm font-label-sm font-medium z-10">
          Mới cập nhật
        </div>
      )
    }
    if (badge === 'hot') {
      return (
        <div className="absolute top-4 left-4 bg-amber-500 text-white px-2.5 py-1 rounded shadow-sm font-label-sm font-medium z-10">
          Hot
        </div>
      )
    }
    return null
  }

  if (variant === 'featured-large') {
    return (
      <article className="col-span-1 h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col relative border border-slate-200/50">
        <Link to={`/phong/${room.id}`} className="absolute inset-0 z-20"><span className="sr-only">Xem chi tiết</span></Link>
        <div className="w-full flex-1 min-h-[300px] relative overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
            style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/600x800/png'}')` }}
          />
          {renderBadge()}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="p-6 flex flex-col justify-between bg-white relative z-30 pointer-events-none">
          <div>
            <p className="font-body-sm text-slate-500 flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {room.property.district}, {room.property.province}
            </p>
            
            <h3 className="font-headline-sm text-slate-900 line-clamp-2 mb-4 leading-tight">{room.title}</h3>
            
            <div className="flex flex-wrap gap-4 text-slate-500 font-label-sm mb-6">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">aspect_ratio</span> {room.area} m²
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">bed</span> {room.maxOccupants} Giường
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="font-headline-sm text-primary">{formattedPrice}<span className="text-sm font-normal text-slate-500"> đ/tháng</span></span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col md:flex-row relative">
        {/* code here was for the horizontal card, keeping it mostly intact just in case */}
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto h-full relative overflow-hidden">
          <div 
            className="w-full h-full min-h-[240px] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
            style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/600x400/png'}')` }}
          />
          {renderBadge()}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="bg-surface-container-lowest/90 backdrop-blur text-text-main px-2 py-1 rounded font-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              {room.images.length}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-sm text-primary uppercase tracking-wider">{room.property.type.replaceAll('_', ' ')}</span>
              <span className="font-headline-sm text-primary">{formattedPrice}<span className="text-sm font-normal text-on-surface-variant">/tháng</span></span>
            </div>
            
            <Link to={`/phong/${room.id}`} className="group-hover:text-primary transition-colors">
              <h3 className="font-headline-sm text-text-main line-clamp-2 mb-2">{room.title}</h3>
            </Link>
            
            <p className="font-body-md text-on-surface-variant flex items-center gap-1 mb-4">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              {room.property.district}, {room.property.province}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant px-2 py-1 rounded font-label-sm">
                <span className="material-symbols-outlined text-[14px]">aspect_ratio</span> {room.area}m²
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant px-2 py-1 rounded font-label-sm">
                <span className="material-symbols-outlined text-[14px]">group</span> Tối đa {room.maxOccupants}
              </span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-label-md">
                {room.property.name.charAt(0)}
              </div>
              <span className="font-label-md text-text-main line-clamp-1">{room.property.name}</span>
            </div>
            <Link 
              to={`/phong/${room.id}`}
              className="font-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1"
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
    <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col relative border border-slate-200/50">
      <Link to={`/phong/${room.id}`} className="absolute inset-0 z-20"><span className="sr-only">Xem chi tiết</span></Link>
      
      <div className="w-full aspect-[4/3] relative overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
          style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/400x300/png'}')` }}
        />
        {renderBadge()}
      </div>
      
      <div className="p-5 flex-1 flex flex-col bg-white relative z-30 pointer-events-none">
        <p className="font-body-sm text-slate-500 flex items-center gap-1 mb-2">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="line-clamp-1">{room.property.district}, {room.property.province}</span>
        </p>
        
        <h3 className="font-headline-sm text-slate-900 line-clamp-2 mb-3 h-12 leading-tight">{room.title}</h3>
        
        <div className="flex items-center gap-4 text-slate-500 mb-5 font-label-sm">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">aspect_ratio</span> {room.area} m²
          </span>
          {room.amenities.find(a => a.name.toLowerCase().includes('ban công')) && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">balcony</span> Có ban công
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
           <span className="font-headline-sm text-primary">{formattedPrice}<span className="text-sm font-normal text-slate-500"> đ/tháng</span></span>
        </div>
      </div>
    </article>
  )
}
