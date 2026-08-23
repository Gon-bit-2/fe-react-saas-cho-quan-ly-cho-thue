import type { UserProfile } from '../api/types'
import { useAuth } from '@/shared/hooks/use-auth'
import { MapPin, Mail, Phone, ShieldCheck, BadgeCheck, Camera, Check } from 'lucide-react'

interface ProfileCardProps {
  user: UserProfile
}

export function ProfileCard({ user }: ProfileCardProps) {
  const { selectedMembership } = useAuth()

  const getRoleLabel = (roleId?: string | null) => {
    switch (roleId) {
      case 'ADMIN':
        return 'Quản trị viên'
      case 'LANDLORD':
        return 'Chủ trọ'
      case 'MANAGER':
        return 'Quản lý vận hành'
      case 'TENANT':
        return 'Người thuê'
      case 'USER':
        return 'Người dùng'
      default:
        return 'Người dùng'
    }
  }

  const displayRole = getRoleLabel(selectedMembership?.roleId || user.systemRole)
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="bg-surface-container-lowest flex flex-col items-center rounded-2xl p-6 text-center shadow-md">
        {/* Avatar */}
        <div className="group/avatar relative mb-4">
          <div className="bg-surface-container-lowest h-32 w-32 overflow-hidden rounded-full p-1 shadow-sm">
            <img
              alt="Profile Picture"
              className="h-full w-full rounded-full object-cover"
              src={
                user.avatarUrl ||
                'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName) + '&background=random'
              }
            />
          </div>
          {/* Hover Edit Overlay */}
          <button className="bg-inverse-surface/60 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full border-none opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100">
            <Camera className="text-on-error h-6 w-6" />
          </button>
          {/* Status Badge */}
          {user.status === 'ACTIVE' && (
            <div
              aria-label="Status: Active"
              className="bg-status-info border-surface-container-lowest absolute right-3 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-4"
            >
              <Check className="text-on-error h-3 w-3" strokeWidth={4} />
            </div>
          )}
        </div>

        {/* Header Info */}
        <h1 className="font-headline-sm text-headline-sm text-on-surface mb-1">{user.fullName}</h1>
        <span className="font-label-md text-label-md text-on-surface-variant mb-6 tracking-wider uppercase">
          {displayRole}
        </span>

        {/* Quick Stats / Badges */}
        <div className="mb-6 flex gap-2">
          {user.status === 'ACTIVE' && (
            <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm flex items-center gap-1 rounded-full px-3 py-1">
              <BadgeCheck className="h-3.5 w-3.5" /> Hoạt động
            </span>
          )}
          {user.systemRole === 'ADMIN' && (
            <span className="bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center gap-1 rounded-full px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Quản trị viên
            </span>
          )}
        </div>

        {/* Contact Details List */}
        <div className="border-surface-border flex w-full flex-col gap-4 border-t pt-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="text-outline h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Địa chỉ Email</span>
              <span className="font-body-md text-body-md text-on-surface">{user.email}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="text-outline h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Số điện thoại</span>
              <span className="font-body-md text-body-md text-on-surface">{user.phone || 'Chưa cập nhật'}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-outline h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Vị trí</span>
              <span className="font-body-md text-body-md text-on-surface">Việt Nam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Decorative Map Card */}
      <div className="bg-surface-container-lowest relative flex h-48 items-end overflow-hidden rounded-2xl p-4 shadow-sm">
        <div className="bg-surface-variant/50 absolute inset-0">
          <div
            className="h-full w-full bg-cover bg-center opacity-70 grayscale filter"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=1000')",
            }}
          ></div>
        </div>
        <div className="bg-surface-container-lowest/90 relative z-10 flex w-full items-center justify-between rounded-xl p-3 shadow-sm backdrop-blur-sm">
          <span className="font-label-md text-label-md text-on-surface font-bold">Khu vực hoạt động chính</span>
          <MapPin className="text-primary h-[18px] w-[18px]" />
        </div>
      </div>
    </div>
  )
}
