import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserProfile } from '../api/types'
import { useAuth } from '@/shared/hooks/use-auth'
import { Settings, User, Mail, Phone, ChevronDown, ArrowRight } from 'lucide-react'

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
  phone: z.string().optional(),
  address: z.string().optional(),
  idCardFrontUrl: z.string().optional(),
  idCardBackUrl: z.string().optional(),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

interface ProfileFormProps {
  user: UserProfile
  isUpdating: boolean
  onUpdate: (data: UpdateProfileFormValues) => void
}

import { useUploadRenterImages } from '@/shared/api/renters'
import { MapPin, Upload } from 'lucide-react'

export function ProfileForm({ user, isUpdating, onUpdate }: ProfileFormProps) {
  const { selectedMembership } = useAuth()
  const uploadImage = useUploadRenterImages()
  
  const tenant = user.tenantMembers?.[0]?.tenant
  const renterProfile = user.renterProfile
  const defaultAddress = tenant?.address || renterProfile?.permanentAddress || ''
  const defaultFrontUrl = tenant?.idCardFrontUrl || renterProfile?.identityFrontUrl || ''
  const defaultBackUrl = tenant?.idCardBackUrl || renterProfile?.identityBackUrl || ''

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
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone || '',
      address: defaultAddress,
      idCardFrontUrl: defaultFrontUrl,
      idCardBackUrl: defaultBackUrl,
    },
  })

  const watchedIdCardFrontUrl = form.watch('idCardFrontUrl')
  const watchedIdCardBackUrl = form.watch('idCardBackUrl')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'idCardFrontUrl' | 'idCardBackUrl') => {
    const file = e.target.files?.[0]
    if (!file) return
    const renterId = user.renterProfile?.id
    if (!renterId) return
    
    try {
      const res = await uploadImage.mutateAsync({ renterId, files: [file] })
      if (res?.[0]?.url) {
        form.setValue(field, res[0].url, { shouldDirty: true })
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="bg-surface-container-lowest flex-1 rounded-2xl p-6 shadow-sm md:p-8">
      <div className="border-surface-border mb-8 flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Thông tin cá nhân</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Cập nhật thông tin và cài đặt tài khoản của bạn.
          </p>
        </div>
        <div className="bg-primary-fixed text-primary hidden h-12 w-12 items-center justify-center rounded-full md:flex">
          <Settings className="h-[24px] w-[24px]" />
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onUpdate)}>
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          {/* Full Name */}
          <div className="col-span-1 flex flex-col gap-2 md:col-span-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"
              htmlFor="fullName"
            >
              Họ và tên
            </label>
            <div className="relative">
              <input
                id="fullName"
                placeholder="Nhập họ và tên"
                type="text"
                {...form.register('fullName')}
                className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 w-full rounded-lg px-4 transition-shadow focus:ring-2 focus:outline-none"
              />
              <User className="text-outline pointer-events-none absolute top-2.5 right-3 h-5 w-5" />
            </div>
            {form.formState.errors.fullName && (
              <span className="text-error text-xs">{form.formState.errors.fullName.message}</span>
            )}
          </div>

          {/* Role (Read Only) */}
          <div className="col-span-1 flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-outline tracking-wider uppercase" htmlFor="role">
              Vai trò
            </label>
            <input
              id="role"
              type="text"
              value={displayRole}
              disabled
              className="bg-surface-variant/30 font-body-md text-body-md text-on-surface-variant h-10 w-full cursor-not-allowed rounded-lg border-none px-4 outline-none"
            />
          </div>

          {/* Email */}
          <div className="col-span-1 mt-4 flex flex-col gap-2 md:col-span-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"
              htmlFor="email"
            >
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 w-full rounded-lg px-4 transition-shadow focus:ring-2 focus:outline-none"
              />
              <Mail className="text-outline pointer-events-none absolute top-2.5 right-3 h-5 w-5" />
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">
              Email này được sử dụng để đăng nhập và thông báo.
            </p>
          </div>

          {/* Phone */}
          <div className="col-span-1 mt-4 flex flex-col gap-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"
              htmlFor="phone"
            >
              Số điện thoại
            </label>
            <div className="relative">
              <input
                id="phone"
                placeholder="Nhập số điện thoại"
                type="tel"
                {...form.register('phone')}
                className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 w-full rounded-lg px-4 transition-shadow focus:ring-2 focus:outline-none"
              />
              <Phone className="text-outline pointer-events-none absolute top-2.5 right-3 h-5 w-5" />
            </div>
          </div>

          {/* Timezone */}
          <div className="col-span-1 mt-4 flex flex-col gap-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"
              htmlFor="timezone"
            >
              Múi giờ
            </label>
            <div className="relative">
              <select
                id="timezone"
                className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 w-full cursor-pointer appearance-none rounded-lg pr-10 pl-4 transition-shadow focus:ring-2 focus:outline-none"
              >
                <option value="ict">(GMT+07:00) Việt Nam</option>
              </select>
              <ChevronDown className="text-outline pointer-events-none absolute top-2.5 right-3 h-5 w-5" />
            </div>
          </div>
          
          {/* Address */}
          <div className="col-span-1 mt-4 flex flex-col gap-2 md:col-span-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"
              htmlFor="address"
            >
              Địa chỉ thường trú
            </label>
            <div className="relative">
              <input
                id="address"
                placeholder="Nhập địa chỉ"
                type="text"
                {...form.register('address')}
                className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 w-full rounded-lg px-4 transition-shadow focus:ring-2 focus:outline-none"
              />
              <MapPin className="text-outline pointer-events-none absolute top-2.5 right-3 h-5 w-5" />
            </div>
          </div>
          
          {/* Identity Cards */}
          <div className="col-span-1 mt-4 flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
              Mặt trước CCCD
            </label>
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant bg-surface transition-colors hover:bg-surface-container">
              {watchedIdCardFrontUrl ? (
                <img src={watchedIdCardFrontUrl} alt="CCCD Mặt trước" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-outline">
                  <Upload className="h-8 w-8" />
                  <span className="font-label-sm text-label-sm">Tải lên ảnh</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'idCardFrontUrl')}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>
          
          <div className="col-span-1 mt-4 flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">
              Mặt sau CCCD
            </label>
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant bg-surface transition-colors hover:bg-surface-container">
              {watchedIdCardBackUrl ? (
                <img src={watchedIdCardBackUrl} alt="CCCD Mặt sau" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-outline">
                  <Upload className="h-8 w-8" />
                  <span className="font-label-sm text-label-sm">Tải lên ảnh</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'idCardBackUrl')}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-surface-border my-4" />

        {/* Preferences Section */}
        <h3 className="font-label-md text-label-md text-on-surface mb-2 font-bold tracking-wider uppercase">
          Tùy chọn
        </h3>
        <div className="bg-surface flex items-center justify-between rounded-xl p-4">
          <div className="flex flex-col gap-1">
            <span className="font-body-md text-body-md text-on-surface font-semibold">Thông báo Email</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Nhận tóm tắt công việc hàng ngày và cảnh báo.
            </span>
          </div>
          {/* Toggle Switch (Visual) */}
          <div className="bg-primary relative h-6 w-12 cursor-pointer rounded-full shadow-inner">
            <div className="bg-on-error absolute top-1 right-1 h-4 w-4 rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-surface-border mt-8 flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            className="bg-surface-container-lowest font-label-md text-label-md text-on-surface hover:bg-surface-container rounded-lg px-5 py-2.5 shadow-sm transition-colors"
            onClick={() => form.reset()}
            disabled={isUpdating}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-primary font-label-md text-label-md text-on-primary hover:bg-primary-container group/btn flex items-center gap-2 rounded-lg px-5 py-2.5 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUpdating || !form.formState.isDirty || uploadImage.isPending}
          >
            {isUpdating || uploadImage.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
            {(!isUpdating && !uploadImage.isPending) && (
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover/btn:translate-x-1" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
