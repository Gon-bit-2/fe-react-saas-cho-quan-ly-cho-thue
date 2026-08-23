import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { ProfileCard } from '../components/profile-card'
import { ProfileForm, type UpdateProfileFormValues } from '../components/profile-form'
import { toast } from 'sonner'
import type { AxiosResponse } from 'axios'
import type { UserProfile } from '../api/types'

export function Component() {
  const queryClient = useQueryClient()

  // Lấy dữ liệu profile
  const { data: profileResponse, isLoading, isError } = useQuery<AxiosResponse<UserProfile>>({
    queryKey: ['auth', 'profile'],
    queryFn: () => profileApi.getProfile()
  })

  // Mutation cập nhật profile
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) => profileApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công')
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ')
    }
  })

  const user = profileResponse?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh] text-error font-medium">
        Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full relative group pb-16">
      {/* Decorative Top Element */}
      <div aria-hidden="true" className="w-full h-32 md:h-48 rounded-2xl bg-gradient-to-r from-primary to-surface-tint mb-8 relative overflow-hidden flex-shrink-0 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-30"></div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-8 -mt-20 lg:-mt-24 relative z-10">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ProfileCard user={user} />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-6">
          <ProfileForm 
            user={user} 
            isUpdating={updateMutation.isPending} 
            onUpdate={(data) => updateMutation.mutate(data)} 
          />
        </div>
      </div>
    </div>
  )
}
