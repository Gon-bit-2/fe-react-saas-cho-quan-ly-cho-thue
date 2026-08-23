import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { utilityMetersControllerUpdate } from '../api'
import { useRoomsControllerList } from '@/shared/api/generated/rooms/rooms'

const formSchema = z.object({
  roomId: z.coerce.number().int().positive('Vui lòng chọn phòng'),
  type: z.enum(['ELECTRICITY', 'WATER'], {
    message: 'Vui lòng chọn loại tiện ích',
  }),
  meterCode: z.string().trim().min(1, 'Mã công tơ không được để trống').max(100),
  unit: z.string().trim().min(1, 'Đơn vị đo không được để trống').max(20),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export interface MeterData {
  id: number
  roomId?: number
  serialNumber?: string
  meterCode?: string
  unit?: string
  type?: 'ELECTRICITY' | 'WATER'
  status?: string
}

export function EditMeterDialog({ children, meter }: { children?: React.ReactNode; meter: MeterData }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  // Lấy danh sách phòng
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRoomsControllerList({
    limit: 100,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rooms = (roomsResponse as unknown as { data?: Array<any> })?.data || []

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: meter.roomId,
      meterCode: meter.serialNumber || meter.meterCode,
      unit: meter.unit || 'kWh',
      type: meter.type || 'ELECTRICITY',
    },
  })

  const { mutate: updateMeter, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof utilityMetersControllerUpdate>[1]) =>
      utilityMetersControllerUpdate(meter.id, data),
    onSuccess: () => {
      toast.success('Cập nhật công tơ thành công')
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; errors?: unknown } } }
      console.error('Lỗi API:', err.response?.data)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật công tơ')
    },
  })

  const onSubmit = (data: FormValues) => {
    updateMeter({
      meterCode: data.meterCode,
      unit: data.unit,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
            Thêm công tơ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa Thông Tin Công Tơ</DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết của công tơ.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Thuộc Phòng</Label>
            <Select
              defaultValue={meter.roomId?.toString()}
              onValueChange={(val) => setValue('roomId', Number(val))}
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRooms ? 'Đang tải...' : 'Chọn phòng'} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.roomCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-sm text-red-500">{errors.roomId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại Tiện Ích</Label>
            <Select
              defaultValue={meter.type || 'ELECTRICITY'}
              onValueChange={(val) => {
                setValue('type', val as 'ELECTRICITY' | 'WATER')
                setValue('unit', val === 'ELECTRICITY' ? 'kWh' : 'm3')
              }}
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tiện ích" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELECTRICITY">Điện</SelectItem>
                <SelectItem value="WATER">Nước</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterCode">Mã Công Tơ</Label>
            <Input
              id="meterCode"
              type="text"
              placeholder="Nhập mã in trên đồng hồ (VD: CT-D-101)"
              {...register('meterCode')}
            />
            {errors.meterCode && <p className="text-sm text-red-500">{errors.meterCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Đơn vị đo</Label>
            <Input id="unit" type="text" placeholder="VD: kWh, m3" {...register('unit')} />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
