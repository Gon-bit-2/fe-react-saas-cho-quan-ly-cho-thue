import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { plansApi } from '@/shared/api/plans'
import { toast } from 'sonner'

const planFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên gói dịch vụ'),
  price: z.coerce.number().min(0, 'Giá không hợp lệ'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  maxProperties: z.coerce.number().nullable().optional(),
  maxRooms: z.coerce.number().nullable().optional(),
  maxManagers: z.coerce.number().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type PlanFormValues = z.infer<typeof planFormSchema>

export function PlanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [initialData, setInitialData] = useState<PlanFormValues | null>(null)

  const form = useForm<PlanFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(planFormSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      billingCycle: 'MONTHLY',
      maxProperties: null,
      maxRooms: null,
      maxManagers: null,
      status: 'ACTIVE',
    },
    values: initialData || undefined,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const status = form.watch('status')

  useEffect(() => {
    if (isEditing) {
      const fetchPlan = async () => {
        try {
          const data = await plansApi.getById(Number(id))
          setInitialData({
            name: data.name,
            price: data.priceMonthly,
            billingCycle: data.billingCycle,
            maxProperties: data.maxProperties,
            maxRooms: data.maxRooms,
            maxManagers: data.maxManagers,
            status: data.status,
          })
        } catch (error) {
          console.error('Lỗi khi tải thông tin gói', error)
        }
      }
      fetchPlan()
    }
  }, [id, isEditing])

  const onSubmit = async (values: PlanFormValues) => {
    const apiValues = {
      name: values.name,
      priceMonthly: values.price,
      priceYearly: values.billingCycle === 'YEARLY' ? values.price : values.price * 12,
      maxProperties: values.maxProperties ?? 1,
      maxRooms: values.maxRooms ?? 1,
      maxStaff: values.maxManagers ?? 1,
      isActive: values.status === 'ACTIVE',
    }
    try {
      if (isEditing) {
        await plansApi.update(Number(id), apiValues)
      } else {
        await plansApi.create({
          code: values.name
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_'),
          ...apiValues,
        })
      }
      toast.success(isEditing ? 'Cập nhật gói dịch vụ thành công' : 'Tạo gói dịch vụ thành công')
      navigate('/admin/goi-dich-vu')
    } catch (error) {
      console.error('Lỗi khi lưu gói', error)
      toast.error('Có lỗi xảy ra khi lưu gói dịch vụ')
    }
  }

  return (
    <div className="animate-in fade-in flex w-full flex-col duration-500">
      {/* Breadcrumbs & Header */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop bg-surface-container-low py-8">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-2">
          <nav className="text-on-surface-variant font-label-md text-label-md flex items-center gap-2">
            <Link to="/admin/goi-dich-vu" className="hover:text-primary flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quản lý gói dịch vụ
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">
              {isEditing ? 'Chỉnh sửa gói' : 'Thêm gói dịch vụ mới'}
            </span>
          </nav>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h1 className="font-display text-display text-on-surface">Cấu hình gói dịch vụ</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
                Thiết lập các thông số chi tiết, giới hạn tài nguyên và tính năng cho gói đăng ký. Thay đổi sẽ có hiệu
                lực ngay lập tức.
              </p>
            </div>
            {isEditing && (
              <div className="hidden md:block">
                <span className="bg-surface-container-highest text-on-surface-variant font-label-md text-label-md inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                  <span className="bg-status-info h-2 w-2 animate-pulse rounded-full"></span>
                  Chế độ chỉnh sửa
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop -mt-6 py-8">
        <div className="mx-auto w-full max-w-[1000px]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Left Column: Basic Info & Pricing */}
              <div className="flex flex-1 flex-col gap-8">
                {/* Basic Information Card */}
                <div className="bg-surface-container-lowest group relative flex flex-col gap-6 overflow-hidden rounded-xl p-6 shadow-sm lg:p-8">
                  <div className="bg-primary-fixed absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-bl-full opacity-50 transition-transform duration-700 group-hover:scale-110"></div>
                  <div className="border-surface-container relative z-10 flex items-center gap-3 border-b pb-4">
                    <div className="bg-primary-container text-on-primary-container flex h-10 w-10 items-center justify-center rounded-lg">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        description
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Thông tin cơ bản</h2>
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">
                        Tên gói dịch vụ <span className="text-error">*</span>
                      </label>
                      <input
                        {...form.register('name')}
                        className="bg-surface font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-primary focus:bg-surface-container-lowest h-10 rounded-lg px-3 transition-all focus:ring-2 focus:outline-none"
                        placeholder="VD: Premium Plan"
                      />
                      {form.formState.errors.name && (
                        <span className="text-error text-[12px]">{form.formState.errors.name.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-surface-container-lowest group relative flex flex-col gap-6 overflow-hidden rounded-xl p-6 shadow-sm lg:p-8">
                  <div className="bg-secondary-fixed absolute right-0 bottom-0 -mr-16 -mb-16 h-40 w-40 rounded-tl-full opacity-30 transition-transform duration-700 group-hover:scale-110"></div>
                  <div className="border-surface-container relative z-10 flex items-center gap-3 border-b pb-4">
                    <div className="bg-secondary-container text-on-secondary-container flex h-10 w-10 items-center justify-center rounded-lg">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        payments
                      </span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Chi phí đăng ký</h2>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">Chu kỳ thanh toán</label>
                      <select
                        {...form.register('billingCycle')}
                        className="bg-surface font-body-md text-body-md text-on-surface focus:ring-primary h-10 rounded-lg px-3 focus:ring-2 focus:outline-none"
                      >
                        <option value="MONTHLY">Hàng tháng</option>
                        <option value="YEARLY">Hàng năm</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">
                        Giá (VND) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...form.register('price')}
                          type="number"
                          className="bg-surface font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-primary h-10 w-full rounded-lg pr-12 pl-3 text-right font-medium transition-all focus:ring-2 focus:outline-none"
                        />
                        <span className="font-label-md text-label-md text-outline absolute top-1/2 right-3 -translate-y-1/2">
                          ₫
                        </span>
                      </div>
                      {form.formState.errors.price && (
                        <span className="text-error text-[12px]">{form.formState.errors.price.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quotas Card */}
                <div className="bg-surface-container-lowest group relative flex flex-col gap-6 overflow-hidden rounded-xl p-6 shadow-sm lg:p-8">
                  <div className="border-surface-container relative z-10 flex items-center gap-3 border-b pb-4">
                    <div className="bg-tertiary-container text-on-tertiary-container flex h-10 w-10 items-center justify-center rounded-lg">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        speed
                      </span>
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">
                        Giới hạn tài nguyên (Quotas)
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-[13px]">
                        Để trống hoặc nhập '0' nếu không giới hạn.
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">Số lượng nhà trọ tối đa</label>
                      <input
                        type="number"
                        {...form.register('maxProperties')}
                        className="bg-surface font-body-md h-10 rounded-lg px-3 text-center"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">Số lượng phòng tối đa</label>
                      <input
                        type="number"
                        {...form.register('maxRooms')}
                        className="bg-surface font-body-md h-10 rounded-lg px-3 text-center"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface">Số lượng nhân viên</label>
                      <input
                        type="number"
                        {...form.register('maxManagers')}
                        className="bg-surface font-body-md h-10 rounded-lg px-3 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Actions */}
              <div className="flex flex-col gap-8 lg:w-[360px]">
                {/* Status Settings */}
                <div className="bg-surface-container-lowest flex flex-col gap-6 rounded-xl p-6 shadow-sm">
                  <div className="border-surface-container flex items-center gap-2 border-b pb-4">
                    <span className="material-symbols-outlined text-outline-variant">toggle_on</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Trạng thái xuất bản</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${status === 'ACTIVE' ? 'border-primary bg-primary-fixed/30' : 'hover:bg-surface-container-low border-transparent'}`}
                    >
                      <input type="radio" value="ACTIVE" {...form.register('status')} className="hidden" />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${status === 'ACTIVE' ? 'border-primary' : 'border-outline'}`}
                      >
                        {status === 'ACTIVE' && <div className="bg-primary h-2.5 w-2.5 rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Hoạt động (Active)
                        </span>
                        <span className="font-body-md text-on-surface-variant text-[13px]">
                          Hiển thị cho người dùng đăng ký ngay
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${status === 'INACTIVE' ? 'border-primary bg-primary-fixed/30' : 'hover:bg-surface-container-low border-transparent'}`}
                    >
                      <input type="radio" value="INACTIVE" {...form.register('status')} className="hidden" />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${status === 'INACTIVE' ? 'border-primary' : 'border-outline'}`}
                      >
                        {status === 'INACTIVE' && <div className="bg-primary h-2.5 w-2.5 rounded-full" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">Bản nháp (Draft / Inactive)</span>
                        <span className="font-body-md text-on-surface-variant text-[13px]">
                          Ẩn khỏi danh sách gói cước public
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="bg-surface-container-lowest sticky top-24 flex flex-col gap-3 rounded-xl p-4 shadow-md">
                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-primary text-on-primary font-label-md text-label-md hover:bg-on-primary-fixed-variant flex h-10 w-full items-center justify-center gap-2 rounded-lg shadow-sm transition-colors"
                  >
                    {form.formState.isSubmitting ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">save</span>
                    )}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/goi-dich-vu')}
                    className="bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-highest h-10 w-full rounded-lg transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
