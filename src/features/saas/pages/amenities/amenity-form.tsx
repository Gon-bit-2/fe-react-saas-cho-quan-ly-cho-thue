import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { amenitiesApi, type IAmenityDTO } from '@/shared/api/amenities'

const amenityFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên tiện ích'),
  category: z.string().min(2, 'Vui lòng nhập nhóm tiện ích'),
  icon: z.string().optional(),
})

type AmenityFormValues = z.infer<typeof amenityFormSchema>

const ICONS = ['ac_unit', 'wifi', 'local_laundry_service', 'directions_car', 'tv', 'kitchen', 'fitness_center', 'pool']

export function AmenityFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [initialData, setInitialData] = useState<AmenityFormValues | null>(null)

  const form = useForm<AmenityFormValues>({
    resolver: zodResolver(amenityFormSchema),
    defaultValues: {
      name: '',
      category: 'Chung',
      icon: 'ac_unit',
    },
    values: initialData || undefined,
  })

  useEffect(() => {
    if (isEditing) {
      // Amenities currently exposes list/update, so edit resolves the selected row from the list.
      const fetchAmenity = async () => {
        try {
          const response = await amenitiesApi.list()
          const data = response.data.find((a: IAmenityDTO) => a.id === Number(id))
          if (data) {
            setInitialData({
              name: data.name,
              category: data.category,
              icon: data.icon || 'ac_unit',
            })
          }
        } catch (error) {
          console.error('Lỗi khi tải thông tin tiện ích', error)
        }
      }
      fetchAmenity()
    }
  }, [id, isEditing])

  const onSubmit = async (values: AmenityFormValues) => {
    try {
      if (isEditing) {
        await amenitiesApi.update(Number(id), values)
      } else {
        await amenitiesApi.create(values)
      }
      navigate('/admin/tien-ich')
    } catch (error) {
      console.error('Lỗi khi lưu tiện ích', error)
    }
  }

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-8 duration-500 lg:flex-row lg:gap-16 lg:px-8">
      <div className="flex w-full flex-col gap-6 lg:sticky lg:top-32 lg:w-1/3">
        <Link
          to="/admin/tien-ich"
          className="font-label-md text-label-md text-primary mb-2 flex w-fit items-center gap-1 hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại danh sách
        </Link>
        <div className="bg-primary-container text-on-primary-container shadow-primary/20 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            home_repair_service
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-label-md text-label-md text-primary tracking-widest uppercase">Quản trị danh mục</span>
          <h1 className="font-display text-display text-on-background">
            {isEditing ? 'Chỉnh sửa tiện ích' : 'Thêm tiện ích mới'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Thiết lập thông tin và hiển thị trực quan cho các tiện ích phòng trọ. Việc chuẩn hóa dữ liệu giúp người thuê
            dễ dàng lọc và tìm kiếm phòng phù hợp.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col lg:w-2/3">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-surface-container-lowest shadow-surface-variant/40 group relative overflow-hidden rounded-[32px] shadow-xl"
        >
          <div className="relative z-10 flex flex-col gap-10 p-8 md:p-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface">Thông tin định danh</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Tên và mô tả sẽ xuất hiện công khai trên các tin đăng của chủ trọ.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2 tracking-wider uppercase">
                  Tên tiện ích <span className="bg-error h-1.5 w-1.5 rounded-full"></span>
                </label>
                <input
                  {...form.register('name')}
                  className="bg-surface-container font-body-lg text-body-lg text-on-surface focus:bg-surface-container-highest placeholder:text-outline h-14 w-full rounded-xl px-5 transition-all outline-none focus:shadow-md"
                  placeholder="Nhập tên tiện ích (VD: Máy giặt chung)"
                />
                {form.formState.errors.name && (
                  <span className="text-error text-[12px]">{form.formState.errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between tracking-wider uppercase">
                  <span>Nhóm tiện ích</span>
                </label>
                <input
                  {...form.register('category')}
                  className="bg-surface-container font-body-md text-body-md text-on-surface focus:bg-surface-container-highest placeholder:text-outline w-full resize-none rounded-xl p-5 transition-all outline-none focus:shadow-md"
                  placeholder="VD: Nội thất, An ninh, Tiện nghi chung"
                />
              </div>
            </div>

            <div className="bg-surface-container-low h-1 w-full rounded-full"></div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface">Hiển thị & Biểu tượng</h2>
              </div>
              <div className="flex flex-col gap-8 md:flex-row lg:gap-12">
                <div className="flex flex-1 flex-col gap-4">
                  <label className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                    Biểu tượng (Icon)
                  </label>
                  <div className="bg-surface flex flex-col gap-5 rounded-2xl p-5 shadow-sm">
                    <Controller
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <>
                          <div className="bg-primary-fixed flex items-center gap-4 rounded-xl p-4">
                            <div className="bg-primary text-on-primary flex h-12 w-12 items-center justify-center rounded-full shadow-sm">
                              <span
                                className="material-symbols-outlined text-[24px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {field.value || 'star'}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-col">
                              <span className="font-label-md text-label-md text-on-primary-fixed truncate">
                                {field.value || 'star'}
                              </span>
                              <span className="font-body-md text-body-md text-on-primary-fixed-variant truncate">
                                Từ thư viện hệ thống
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3">
                            {ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => field.onChange(icon)}
                                className={`flex aspect-square items-center justify-center rounded-xl transition-all ${field.value === icon ? 'bg-surface-container-highest text-on-surface shadow-inner' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                              >
                                <span className="material-symbols-outlined text-[24px]">{icon}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container flex items-center justify-between gap-4 rounded-b-[32px] px-8 py-6 sm:justify-end md:px-12">
            <button
              type="button"
              onClick={() => navigate('/admin/tien-ich')}
              className="font-label-md text-label-md text-on-surface bg-surface-container-lowest hover:bg-surface rounded-xl px-6 py-3.5 shadow-sm transition-all hover:shadow-md"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="font-label-md text-label-md text-on-primary bg-primary shadow-primary/30 flex items-center gap-2 rounded-xl px-8 py-3.5 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {form.formState.isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              )}
              Lưu tiện ích
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
