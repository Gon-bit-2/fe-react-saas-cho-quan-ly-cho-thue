import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserProfile } from '../api/types'
import { Settings, User, Mail, Phone, ChevronDown, ArrowRight } from 'lucide-react'

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
  phone: z.string().optional(),
})

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

interface ProfileFormProps {
  user: UserProfile
  isUpdating: boolean
  onUpdate: (data: UpdateProfileFormValues) => void
}

export function ProfileForm({ user, isUpdating, onUpdate }: ProfileFormProps) {
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName,
      phone: user.phone || '',
    },
  })

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 md:p-8 flex-1">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-border">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Thông tin cá nhân</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Cập nhật thông tin và cài đặt tài khoản của bạn.</p>
        </div>
        <div className="hidden md:flex h-12 w-12 rounded-full bg-primary-fixed items-center justify-center text-primary">
          <Settings className="w-[24px] h-[24px]" />
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onUpdate)}>
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">Họ và tên</label>
            <div className="relative">
              <input 
                id="fullName" 
                placeholder="Nhập họ và tên" 
                type="text" 
                {...form.register('fullName')}
                className="w-full h-10 px-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
              />
              <User className="absolute right-3 top-2.5 text-outline w-5 h-5 pointer-events-none" />
            </div>
            {form.formState.errors.fullName && (
              <span className="text-xs text-error">{form.formState.errors.fullName.message}</span>
            )}
          </div>

          {/* Role (Read Only) */}
          <div className="flex flex-col gap-2 col-span-1">
            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider" htmlFor="role">Vai trò</label>
            <input 
              id="role" 
              type="text" 
              value={user.systemRole || 'Thành viên'} 
              disabled 
              className="w-full h-10 px-4 bg-surface-variant/30 rounded-lg font-body-md text-body-md text-on-surface-variant cursor-not-allowed border-none outline-none" 
            />
          </div>

          {/* Department (Mock) */}
          <div className="flex flex-col gap-2 col-span-1">
            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider" htmlFor="dept">Phòng ban</label>
            <input 
              id="dept" 
              type="text" 
              value="Quản lý tài sản" 
              disabled 
              className="w-full h-10 px-4 bg-surface-variant/30 rounded-lg font-body-md text-body-md text-on-surface-variant cursor-not-allowed border-none outline-none" 
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 col-span-1 md:col-span-2 mt-4">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="email">Địa chỉ Email</label>
            <div className="relative">
              <input 
                id="email" 
                type="email" 
                value={user.email} 
                disabled 
                className="w-full h-10 px-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
              />
              <Mail className="absolute right-3 top-2.5 text-outline w-5 h-5 pointer-events-none" />
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Email này được sử dụng để đăng nhập và thông báo.</p>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2 col-span-1 mt-4">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="phone">Số điện thoại</label>
            <div className="relative">
              <input 
                id="phone" 
                placeholder="Nhập số điện thoại" 
                type="tel" 
                {...form.register('phone')}
                className="w-full h-10 px-4 bg-surface rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" 
              />
              <Phone className="absolute right-3 top-2.5 text-outline w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Timezone */}
          <div className="flex flex-col gap-2 col-span-1 mt-4">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="timezone">Múi giờ</label>
            <div className="relative">
              <select 
                id="timezone" 
                className="w-full h-10 pl-4 pr-10 bg-surface rounded-lg font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-shadow cursor-pointer"
              >
                <option value="ict">(GMT+07:00) Indochina Time</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-outline w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-surface-border my-4" />

        {/* Preferences Section */}
        <h3 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-2">Tùy chọn</h3>
        <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
          <div className="flex flex-col gap-1">
            <span className="font-body-md text-body-md text-on-surface font-semibold">Thông báo Email</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Nhận tóm tắt công việc hàng ngày và cảnh báo.</span>
          </div>
          {/* Toggle Switch (Visual) */}
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
            <div className="absolute right-1 top-1 w-4 h-4 bg-on-error rounded-full shadow-sm"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-surface-border">
          <button 
            type="button" 
            className="px-5 py-2.5 rounded-lg bg-surface-container-lowest font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors shadow-sm"
            onClick={() => form.reset()}
            disabled={isUpdating}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 rounded-lg bg-primary font-label-md text-label-md text-on-primary hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 group/btn"
            disabled={isUpdating || !form.formState.isDirty}
          >
            {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            {!isUpdating && <ArrowRight className="w-[18px] h-[18px] group-hover/btn:translate-x-1 transition-transform" />}
          </button>
        </div>
      </form>
    </div>
  )
}
