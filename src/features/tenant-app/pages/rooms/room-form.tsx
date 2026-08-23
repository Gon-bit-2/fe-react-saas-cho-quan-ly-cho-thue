
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRoom, useProperties, useCreateRoom, useUpdateRoom, useFloors, useUploadRoomImages } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save, Building2, MapPin, Loader2, ImageIcon } from 'lucide-react'
import { useRef } from 'react'
import type { Property, CreateRoomDto, UpdateRoomDto, Floor } from '@/features/tenant-app/types'
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

type RoomFormInput = z.input<typeof roomFormSchema>
type RoomFormValues = z.output<typeof roomFormSchema>

export function Component() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const defaultPropertyId = searchParams.get('propertyId')
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: initialData, isLoading: loadingRoom } = useRoom(Number(id))
  const { data: propertiesData, isLoading: loadingProps } = useProperties()

  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom(Number(id))
  const uploadRoomImage = useUploadRoomImages(Number(id))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RoomFormInput, unknown, RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      propertyId: defaultPropertyId || '',
      roomCode: '',
      floorId: 'none',
      title: '',
      area: 0,
      maxOccupants: 1,
      basePrice: 0,
      depositAmount: 0,
      electricityPrice: 0,
      waterPrice: 0,
      description: '',
      status: 'AVAILABLE',
      marketplaceStatus: 'DRAFT',
    },
    values: initialData ? {
      propertyId: initialData.propertyId?.toString() || '',
      roomCode: initialData.roomCode || '',
      floorId: initialData.floorId?.toString() || 'none',
      title: initialData.title || '',
      area: initialData.area || 0,
      maxOccupants: initialData.maxOccupants || 1,
      basePrice: initialData.basePrice || 0,
      depositAmount: initialData.depositAmount || 0,
      electricityPrice: initialData.electricityPrice || 0,
      waterPrice: initialData.waterPrice || 0,
      description: initialData.description || '',
      status: initialData.status || 'AVAILABLE',
      marketplaceStatus: initialData.marketplaceStatus || 'DRAFT',
    } : undefined,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPropertyId = watch('propertyId')
  const { data: floorsData } = useFloors(selectedPropertyId)
  const floors = floorsData || []

  // Using `values` prop in useForm replaces the need for useEffect and reset

  const onSubmit = async (data: RoomFormValues) => {
    try {
      const floorId = data.floorId && data.floorId !== 'none' ? Number(data.floorId) : undefined

      if (isEditing) {
        const updatePayload: UpdateRoomDto = {
          roomCode: data.roomCode,
          title: data.title,
          area: data.area,
          maxOccupants: data.maxOccupants,
          basePrice: data.basePrice,
          depositAmount: data.depositAmount,
          electricityPrice: data.electricityPrice,
          waterPrice: data.waterPrice,
          description: data.description,
          floorId,
        }
        await updateRoom.mutateAsync(updatePayload)
        toast.success('Cập nhật phòng thành công!')
      } else {
        const createPayload: CreateRoomDto = {
          propertyId: Number(data.propertyId),
          roomCode: data.roomCode,
          title: data.title,
          area: data.area,
          maxOccupants: data.maxOccupants,
          basePrice: data.basePrice,
          depositAmount: data.depositAmount,
          electricityPrice: data.electricityPrice,
          waterPrice: data.waterPrice,
          description: data.description,
          status: data.status,
          floorId,
        }
        await createRoom.mutateAsync(createPayload)
        toast.success('Đã thêm phòng mới thành công!')
      }
      navigate('/quan-ly-phong/danh-sach')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!')
    }
  }

  const isSubmitting = createRoom.isPending || updateRoom.isPending || uploadRoomImage.isPending

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isEditing) {
      toast.error('Vui lòng lưu thông tin phòng trước khi tải ảnh lên')
      return
    }

    try {
      await uploadRoomImage.mutateAsync([file])
      toast.success('Tải ảnh phòng thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi tải ảnh lên!')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if ((isEditing && loadingRoom) || loadingProps) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="font-medium text-slate-500">Đang tải thông tin...</p>
      </div>
    )
  }

  const properties = propertiesData?.data || []
  const selectedProperty = properties.find((p: Property) => p.id.toString() === selectedPropertyId)

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-8 pb-12 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Chỉnh sửa thông tin phòng' : 'Thêm phòng mới'}
            </h2>
            <p className="mt-1 text-slate-500">
              {isEditing
                ? 'Cập nhật các thông số chi tiết của phòng'
                : 'Thiết lập phòng mới để đưa vào hoạt động ngay hôm nay'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Building2 className="h-5 w-5 text-indigo-500" />
              Định danh phòng
            </CardTitle>
            <CardDescription>Cơ sở, tòa nhà và mã phòng định danh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-white p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6 pb-2 border-b border-slate-100">
              <div className="relative group">
                <div className="h-24 w-24 overflow-hidden rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                  {initialData?.images && initialData.images.length > 0 ? (
                    <img src={initialData.images[0].url} alt="Cover" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 text-slate-300" />
                  )}
                </div>
                {isEditing && (
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-2 flex-1 pt-2">
                <Label className="font-medium text-slate-700">
                  Ảnh đại diện phòng
                </Label>
                <p className="text-sm text-slate-500">
                  {isEditing ? 'Nhấn vào ảnh bên cạnh để tải lên ảnh đại diện mới cho phòng.' : 'Bạn có thể tải ảnh đại diện sau khi hoàn tất tạo phòng.'}
                </p>
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="propertyId" className="font-medium text-slate-700">
                  Nhà trọ / Tòa nhà <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="propertyId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={`border-slate-200 bg-slate-50 ${errors.propertyId ? 'border-red-500 ring-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Chọn nhà trọ/cơ sở" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p: Property) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.propertyId && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.propertyId.message}</p>
                )}
                {selectedProperty && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>
                      {selectedProperty.addressDetail}
                      {selectedProperty.ward && `, ${selectedProperty.ward}`}
                      {selectedProperty.district && `, ${selectedProperty.district}`}
                      {selectedProperty.province && `, ${selectedProperty.province}`}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="roomCode" className="font-medium text-slate-700">
                  Mã phòng (Số phòng) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('roomCode')}
                  id="roomCode"
                  placeholder="VD: P.101, A2..."
                  className={`border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 ${errors.roomCode ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.roomCode && <p className="mt-1 text-sm font-medium text-red-500">{errors.roomCode.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="font-medium text-slate-700">
                  Tên hiển thị (Tiêu đề) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('title')}
                  id="title"
                  placeholder="VD: Phòng Studio Full Nội Thất Tầng 1"
                  className={`border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 ${errors.title ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.title && <p className="mt-1 text-sm font-medium text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="floorId" className="font-medium text-slate-700">
                  Tầng số (Tùy chọn)
                </Label>
                <Controller
                  name="floorId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-slate-200 bg-slate-50">
                        <SelectValue placeholder="Chọn tầng (Tùy chọn)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không chọn --</SelectItem>
                        {floors.map((f: Floor) => (
                          <SelectItem key={f.id} value={f.id.toString()}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
              <MapPin className="h-5 w-5 text-emerald-500" />
              Thông số & Giá cả
            </CardTitle>
            <CardDescription>Diện tích, sức chứa và các chi phí thuê</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-white p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2.5">
                <Label htmlFor="area" className="font-medium text-slate-700">
                  Diện tích (m²)
                </Label>
                <Input
                  {...register('area')}
                  id="area"
                  type="number"
                  className="border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
                />
                {errors.area && <p className="mt-1 text-sm font-medium text-red-500">{errors.area.message}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="maxOccupants" className="font-medium text-slate-700">
                  Sức chứa tối đa (người)
                </Label>
                <Input
                  {...register('maxOccupants')}
                  id="maxOccupants"
                  type="number"
                  className="border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
                />
                {errors.maxOccupants && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.maxOccupants.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="basePrice" className="font-medium text-slate-700">
                  Giá thuê (VND/tháng) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('basePrice')}
                  id="basePrice"
                  type="number"
                  className="border-slate-200 bg-slate-50 font-semibold text-emerald-700 focus-visible:ring-emerald-500"
                />
                {errors.basePrice && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="depositAmount" className="font-medium text-slate-700">
                  Tiền cọc (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('depositAmount')}
                  id="depositAmount"
                  type="number"
                  className="border-slate-200 bg-slate-50 font-semibold focus-visible:ring-emerald-500"
                />
                {errors.depositAmount && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.depositAmount.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="electricityPrice" className="font-medium text-slate-700">
                  Giá điện (VND/kWh)
                </Label>
                <Input
                  {...register('electricityPrice')}
                  id="electricityPrice"
                  type="number"
                  className="border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
                />
                {errors.electricityPrice && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.electricityPrice.message}</p>
                )}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="waterPrice" className="font-medium text-slate-700">
                  Giá nước (VND/khối)
                </Label>
                <Input
                  {...register('waterPrice')}
                  id="waterPrice"
                  type="number"
                  className="border-slate-200 bg-slate-50 focus-visible:ring-emerald-500"
                />
                {errors.waterPrice && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.waterPrice.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <Label htmlFor="description" className="font-medium text-slate-700">
                Mô tả chi tiết (Tùy chọn)
              </Label>
              <Textarea
                {...register('description')}
                id="description"
                placeholder="Mô tả các tiện ích trong phòng, lưu ý, nội quy riêng biệt..."
                className={`border-slate-200 bg-slate-50 min-h-[100px] focus-visible:ring-emerald-500 ${errors.description ? 'border-red-500 ring-red-500' : ''}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm font-medium text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-6">
            <CardTitle className="text-xl text-slate-800">Cấu hình trạng thái</CardTitle>
            <CardDescription>Trạng thái vật lý và trạng thái hiển thị trên marketplace</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 bg-white p-6">
            <div className="space-y-2.5">
              <Label className="font-medium text-slate-700">Trạng thái phòng</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-slate-200 bg-slate-50">
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
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 px-6"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu thông tin phòng
          </Button>
        </div>
      </form>
    </div>
  )
}
