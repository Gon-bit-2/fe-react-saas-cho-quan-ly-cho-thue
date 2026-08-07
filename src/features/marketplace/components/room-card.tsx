import { Link } from 'react-router'
import type { MarketplaceRoom } from '../types'

interface RoomCardProps {
  room: MarketplaceRoom
  variant?: 'default' | 'featured'
}

export function RoomCard({ room, variant = 'default' }: RoomCardProps) {
  const thumbnail = room.images.find(img => img.isThumbnail) || room.images[0]
  
  // Format currency
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(room.basePrice)

  if (variant === 'featured') {
    return (
      <article className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col md:flex-row relative">
        <div className="w-full md:w-1/2 aspect-video md:aspect-auto h-full relative overflow-hidden">
          <div 
            className="w-full h-full min-h-[240px] bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
            style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/600x400/png'}')` }}
          />
          <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-2 py-1 rounded font-label-sm shadow-sm">
            Nổi bật
          </div>
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
              <span className="font-label-sm text-primary uppercase tracking-wider">{room.property.propertyType.replace('_', ' ')}</span>
              <span className="font-headline-sm text-primary">{formattedPrice}<span className="text-sm font-normal text-on-surface-variant">/tháng</span></span>
            </div>
            
            <Link to={`/rooms/${room.id}`} className="group-hover:text-primary transition-colors">
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
              {room.amenities.slice(0, 2).map(amenity => (
                <span key={amenity.id} className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant px-2 py-1 rounded font-label-sm">
                  {amenity.icon && <span className="material-symbols-outlined text-[14px]">{amenity.icon}</span>}
                  {amenity.name}
                </span>
              ))}
              {room.amenities.length > 2 && (
                <span className="inline-flex items-center bg-surface-container-low text-on-surface-variant px-2 py-1 rounded font-label-sm">
                  +{room.amenities.length - 2}
                </span>
              )}
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
              to={`/rooms/${room.id}`}
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
    <article className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col relative border border-surface-border">
      <div className="w-full aspect-[4/3] relative overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
          style={{ backgroundImage: `url('${thumbnail?.url || 'https://placehold.co/400x300/png'}')` }}
        />
        <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur text-text-main px-2 py-1 rounded font-label-sm shadow-sm">
          {room.property.propertyType.replace('_', ' ')}
        </div>
        <div className="absolute bottom-3 right-3 bg-surface-container-lowest/90 backdrop-blur text-text-main px-2 py-1 rounded font-label-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">photo_camera</span>
          {room.images.length}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="font-headline-sm text-primary">{formattedPrice}<span className="text-sm font-normal text-on-surface-variant">/tháng</span></span>
        </div>
        
        <Link to={`/rooms/${room.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-label-md text-text-main line-clamp-2 mb-2 h-8">{room.title}</h3>
        </Link>
        
        <p className="font-body-md text-on-surface-variant flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="line-clamp-1">{room.property.district}, {room.property.province}</span>
        </p>
        
        <div className="flex items-center gap-4 text-on-surface-variant mb-4 font-label-sm">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">aspect_ratio</span> {room.area}m²
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">group</span> Lên đến {room.maxOccupants}
          </span>
        </div>
        
        <div className="mt-auto pt-4 border-t border-surface-border flex items-center justify-between">
           <span className="font-label-md text-on-surface-variant line-clamp-1">{room.property.name}</span>
        </div>
      </div>
    </article>
  )
}
