import { useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { utilityMetersControllerCreate } from '../api'
import { useRoomsControllerList } from '@/shared/api/generated/rooms/rooms'
import { useProperties } from '@/shared/api/properties'
import { Zap, Droplet, Plus, Loader2, Building2, DoorOpen } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

const formSchema = z.object({
  propertyId: z.string().optional(),
  roomId: z.coerce.number().int().positive('Vui lòng chọn phòng'),
  type: z.enum(['ELECTRICITY', 'WATER'], {
    message: 'Vui lòng chọn loại tiện ích',
  }),
  meterCode: z.string().trim().min(1, 'Mã công tơ không được để trống').max(100),
  unit: z.string().trim().min(1, 'Đơn vị đo không được để trống').max(20),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

interface CreateMeterDialogProps {
  children?: React.ReactNode
  /** Gợi ý phòng mặc định nếu mở từ trang chi tiết phòng */
  defaultRoomId?: number
}

/**
 * Hộp thoại thêm mới công tơ điện / nước cho phòng trọ.
 * Cho phép chọn khu trọ, lọc phòng tương ứng, chọn loại tiện ích và mã công tơ.
 */
export function CreateMeterDialog({ children, defaultRoomId }: CreateMeterDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL')
  const queryClient = useQueryClient()

  // Lấy danh sách khu trọ
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  // Lấy danh sách phòng
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRoomsControllerList({
    limit: 200,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRooms = useMemo(() => (roomsResponse as unknown as { data?: Array<any> })?.data || [], [roomsResponse])

  // Lọc phòng theo khu trọ nếu đã chọn
  const filteredRooms = useMemo(() => {
    if (selectedPropertyId === 'ALL') return allRooms
    return allRooms.filter((r) => r.propertyId?.toString() === selectedPropertyId)
  }, [allRooms, selectedPropertyId])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'kWh',
      type: 'ELECTRICITY',
      roomId: defaultRoomId,
    },
  })

  const currentType = useWatch({ control, name: 'type' })

  const { mutate: createMeter, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof utilityMetersControllerCreate>[0]) => utilityMetersControllerCreate(data),
    onSuccess: () => {
      toast.success('Thêm công tơ thành công')
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; errors?: unknown } } }
      console.error('Lỗi API:', err.response?.data)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm công tơ')
    },
  })

  const onSubmit = (data: FormValues) => {
    createMeter({
      roomId: data.roomId,
      type: data.type,
      meterCode: data.meterCode,
      unit: data.unit,
      status: 'ACTIVE',
    })
  }

  const handleSelectType = (type: 'ELECTRICITY' | 'WATER') => {
    setValue('type', type)
    setValue('unit', type === 'ELECTRICITY' ? 'kWh' : 'm³')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9 px-4 text-sm">
            <Plus className="h-4 w-4" /> Thêm công tơ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Thêm Công Tơ Tiện Ích Mới
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Tạo mới đồng hồ đo điện hoặc nước sinh hoạt và gắn vào phòng tương ứng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Lựa chọn loại tiện ích dạng Cards trực quan */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Loại tiện ích *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectType('ELECTRICITY')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  currentType === 'ELECTRICITY'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  currentType === 'ELECTRICITY' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Công tơ điện</div>
                  <div className="text-xs text-slate-500">Đo điện năng (kWh)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectType('WATER')}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  currentType === 'WATER'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  currentType === 'WATER' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Droplet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Công tơ nước</div>
                  <div className="text-xs text-slate-500">Lưu lượng nước (m³)</div>
                </div>
              </button>
            </div>
            {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
          </div>

          {/* Lọc khu trọ & chọn phòng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Khu trọ</Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="h-9 bg-slate-50 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <SelectValue placeholder="Tất cả khu trọ" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">Tất cả khu trọ</SelectItem>
                  {properties.map((p: Property) => (
                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomId" className="text-xs font-semibold text-slate-700">
                Gắn vào phòng *
              </Label>
              <Select
                defaultValue={defaultRoomId ? defaultRoomId.toString() : undefined}
                onValueChange={(val) => setValue('roomId', Number(val))}
              >
                <SelectTrigger className="h-9 bg-slate-50 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <DoorOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <SelectValue placeholder={isLoadingRooms ? 'Đang tải...' : 'Chọn phòng'} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filteredRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()} className="text-xs">
                      Phòng {room.roomCode} {room.title ? `(${room.title})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && <p className="text-xs text-rose-500">{errors.roomId.message}</p>}
            </div>
          </div>

          {/* Mã công tơ & Đơn vị đo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="meterCode" className="text-xs font-semibold text-slate-700">
                Mã / Serial công tơ *
              </Label>
              <Input
                id="meterCode"
                type="text"
                placeholder="VD: CT-DIEN-101"
                className="h-9 text-sm"
                {...register('meterCode')}
              />
              {errors.meterCode && <p className="text-xs text-rose-500">{errors.meterCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit" className="text-xs font-semibold text-slate-700">
                Đơn vị đo *
              </Label>
              <Input
                id="unit"
                type="text"
                placeholder="kWh / m³"
                className="h-9 text-sm"
                {...register('unit')}
              />
              {errors.unit && <p className="text-xs text-rose-500">{errors.unit.message}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-9 text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? 'Đang tạo...' : 'Tạo công tơ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
