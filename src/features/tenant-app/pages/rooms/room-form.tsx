import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRoom, useProperties } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Building2, MapPin, Loader2 } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'
import { toast } from 'sonner'

const roomFormSchema = z.object({
  propertyId: z.string().min(1, 'Vui lòng chọn tòa nhà'),
  roomCode: z.string().min(1, 'Vui lòng nhập mã phòng'),
  floorId: z.string().optional(),
  title: z.string().min(2, 'Vui lòng nhập tên/tiêu đề phòng'),
  area: z.coerce.number().positive('Diện tích phải lớn hơn 0'),
  maxOccupants: z.coerce.number().positive('Số người tối đa phải lớn hơn 0'),
  basePrice: z.coerce.number().nonnegative('Giá thuê không hợp lệ'),
  depositAmount: z.coerce.number().nonnegative('Tiền cọc không hợp lệ'),
  electricityPrice: z.coerce.number().nonnegative('Giá điện không hợp lệ'),
  waterPrice: z.coerce.number().nonnegative('Giá nước không hợp lệ'),
  description: z.string().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'INACTIVE']),
  marketplaceStatus: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'HIDDEN']),
})

type RoomFormValues = z.infer<typeof roomFormSchema>

export function Component() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const defaultPropertyId = searchParams.get('propertyId')
  const navigate = useNavigate()
  const isEditing = !!id
  
  const { data: initialData, isLoading: loadingRoom } = useRoom(Number(id))
  const { data: propertiesData, isLoading: loadingProps } = useProperties()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      propertyId: defaultPropertyId || '',
      roomCode: '',
      floorId: '',
      title: '',
      area: 0,
      maxOccupants: 1,
      basePrice: 0,
      depositAmount: 0,
      electricityPrice: 0,
      waterPrice: 0,
      description: '',
      status: 'AVAILABLE',
      marketplaceStatus: 'DRAFT'
    }
  })

  useEffect(() => {
    if (initialData) {
      reset({
        propertyId: initialData.propertyId?.toString() || '',
        roomCode: initialData.roomCode || '',
        floorId: initialData.floorId?.toString() || '',
        title: initialData.title || '',
        area: initialData.area || 0,
        maxOccupants: initialData.maxOccupants || 1,
        basePrice: initialData.basePrice || 0,
        depositAmount: initialData.depositAmount || 0,
        electricityPrice: initialData.electricityPrice || 0,
        waterPrice: initialData.waterPrice || 0,
        description: initialData.description || '',
        status: initialData.status || 'AVAILABLE',
        marketplaceStatus: initialData.marketplaceStatus || 'DRAFT'
      })
    }
  }, [initialData, reset])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (_data: RoomFormValues) => {
    setIsSubmitting(true)
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success(isEditing ? 'Cập nhật phòng thành công!' : 'Đã thêm phòng mới thành công!')
      navigate('/quan-ly-phong/danh-sach')
    }, 1000)
  }

  if ((isEditing && loadingRoom) || loadingProps) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-slate-500 font-medium">Đang tải thông tin...</p>
      </div>
    )
  }

  const properties = propertiesData?.data || []

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Chỉnh sửa thông tin phòng' : 'Thêm phòng mới'}
            </h2>
            <p className="text-slate-500 mt-1">
              {isEditing ? 'Cập nhật các thông số chi tiết của phòng' : 'Thiết lập phòng mới để đưa vào hoạt động ngay hôm nay'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200/60 pb-6">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Định danh phòng
            </CardTitle>
            <CardDescription>Cơ sở, tòa nhà và mã phòng định danh</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="propertyId" className="text-slate-700 font-medium">Nhà trọ / Tòa nhà <span className="text-red-500">*</span></Label>
                <Controller
                  name="propertyId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`bg-slate-50 border-slate-200 ${errors.propertyId ? 'border-red-500 ring-red-500' : ''}`}>
                        <SelectValue placeholder="Chọn nhà trọ/cơ sở" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p: Property) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyId && <p className="text-sm text-red-500 font-medium mt-1">{errors.propertyId.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="roomCode" className="text-slate-700 font-medium">Mã phòng (Số phòng) <span className="text-red-500">*</span></Label>
                <Input 
                  {...register('roomCode')}
                  id="roomCode" 
                  placeholder="VD: P.101, A2..." 
                  className={`bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 ${errors.roomCode ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.roomCode && <p className="text-sm text-red-500 font-medium mt-1">{errors.roomCode.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-slate-700 font-medium">Tên hiển thị (Tiêu đề) <span className="text-red-500">*</span></Label>
                <Input 
                  {...register('title')}
                  id="title" 
                  placeholder="VD: Phòng Studio Full Nội Thất Tầng 1" 
                  className={`bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 ${errors.title ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.title && <p className="text-sm text-red-500 font-medium mt-1">{errors.title.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="floorId" className="text-slate-700 font-medium">Tầng số (Tùy chọn)</Label>
                <Input 
                  {...register('floorId')}
                  id="floorId" 
                  type="number"
                  placeholder="VD: 1, 2, 3"
                  className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200/60 pb-6">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Thông số & Giá cả
            </CardTitle>
            <CardDescription>Diện tích, sức chứa và các chi phí thuê</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="area" className="text-slate-700 font-medium">Diện tích (m²)</Label>
                <Input 
                  {...register('area')}
                  id="area" 
                  type="number" 
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500" 
                />
                {errors.area && <p className="text-sm text-red-500 font-medium mt-1">{errors.area.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="maxOccupants" className="text-slate-700 font-medium">Sức chứa tối đa (người)</Label>
                <Input 
                  {...register('maxOccupants')}
                  id="maxOccupants" 
                  type="number" 
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500" 
                />
                {errors.maxOccupants && <p className="text-sm text-red-500 font-medium mt-1">{errors.maxOccupants.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2.5">
                <Label htmlFor="basePrice" className="text-slate-700 font-medium">Giá thuê (VND/tháng) <span className="text-red-500">*</span></Label>
                <Input 
                  {...register('basePrice')}
                  id="basePrice" 
                  type="number" 
                  step={100000}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 font-semibold text-emerald-700" 
                />
                {errors.basePrice && <p className="text-sm text-red-500 font-medium mt-1">{errors.basePrice.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="depositAmount" className="text-slate-700 font-medium">Tiền cọc (VND) <span className="text-red-500">*</span></Label>
                <Input 
                  {...register('depositAmount')}
                  id="depositAmount" 
                  type="number" 
                  step={100000}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 font-semibold" 
                />
                {errors.depositAmount && <p className="text-sm text-red-500 font-medium mt-1">{errors.depositAmount.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-200/60 pb-6">
            <CardTitle className="text-xl text-slate-800">Cấu hình trạng thái</CardTitle>
            <CardDescription>Trạng thái vật lý và trạng thái hiển thị trên marketplace</CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-slate-700 font-medium">Trạng thái phòng</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Phòng trống (Sẵn sàng thuê)</SelectItem>
                      <SelectItem value="OCCUPIED">Đang cho thuê</SelectItem>
                      <SelectItem value="RESERVED">Đã được đặt (Cọc)</SelectItem>
                      <SelectItem value="MAINTENANCE">Đang bảo trì/Sửa chữa</SelectItem>
                      <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-slate-700 font-medium">Trạng thái Marketplace</Label>
              <Controller
                name="marketplaceStatus"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Đăng tin?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Chưa đăng (Nháp)</SelectItem>
                      <SelectItem value="PENDING_REVIEW">Đang chờ duyệt</SelectItem>
                      <SelectItem value="PUBLISHED">Đã đăng (Published)</SelectItem>
                      <SelectItem value="HIDDEN">Đã ẩn</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="sticky bottom-4 flex justify-end gap-3 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg">
          <Button type="button" variant="outline" className="border-slate-300 px-6" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thông tin phòng
          </Button>
        </div>
      </form>
    </div>
  )
}
