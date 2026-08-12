import type { UserProfile } from '../api/types'
import { MapPin, Mail, Phone, ShieldCheck, BadgeCheck, Camera, Check } from 'lucide-react'

interface ProfileCardProps {
  user: UserProfile
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative group/avatar mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden p-1 bg-surface-container-lowest shadow-sm">
            <img
              alt="Profile Picture"
              className="w-full h-full object-cover rounded-full"
              src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName) + '&background=random'}
            />
          </div>
          {/* Hover Edit Overlay */}
          <button className="absolute inset-0 bg-inverse-surface/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer border-none">
            <Camera className="w-6 h-6 text-on-error" />
          </button>
          {/* Status Badge */}
          {user.status === 'ACTIVE' && (
            <div
              aria-label="Status: Active"
              className="absolute bottom-1 right-3 w-6 h-6 bg-status-info rounded-full border-4 border-surface-container-lowest flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-on-error" strokeWidth={4} />
            </div>
          )}
        </div>

        {/* Header Info */}
        <h1 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          {user.fullName}
        </h1>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-6">
          {user.systemRole || 'Thành viên'}
        </span>

        {/* Quick Stats / Badges */}
        <div className="flex gap-2 mb-6">
          {user.status === 'ACTIVE' && (
            <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Hoạt động
            </span>
          )}
          {user.systemRole === 'ADMIN' && (
            <span className="px-3 py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Quản trị viên
            </span>
          )}
        </div>

        {/* Contact Details List */}
        <div className="w-full flex flex-col gap-4 text-left border-t border-surface-border pt-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-outline" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Địa chỉ Email
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                {user.email}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-outline" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Số điện thoại
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                {user.phone || 'Chưa cập nhật'}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-outline" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Vị trí
              </span>
              <span className="font-body-md text-body-md text-on-surface">
                Việt Nam
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Decorative Map Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm h-48 relative overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-surface-variant/50">
          <div
            className="w-full h-full bg-cover bg-center opacity-70 filter grayscale"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1000')",
            }}
          ></div>
        </div>
        <div className="relative z-10 bg-surface-container-lowest/90 backdrop-blur-sm p-3 rounded-xl w-full flex items-center justify-between shadow-sm">
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Khu vực hoạt động chính
          </span>
          <MapPin className="text-primary w-[18px] h-[18px]" />
        </div>
      </div>
    </div>
  )
}
