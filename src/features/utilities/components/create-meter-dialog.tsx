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
import { utilityMetersControllerCreate } from '../api'
import { useRoomsControllerList } from '@/shared/api/generated/rooms/rooms'

const formSchema = z.object({
  roomId: z.coerce.number().int().positive('Vui lòng chọn phòng'),
  type: z.enum(['ELECTRICITY', 'WATER'], {
    required_error: 'Vui lòng chọn loại tiện ích',
  }),
  meterCode: z.string().trim().min(1, 'Mã công tơ không được để trống').max(100),
  unit: z.string().trim().min(1, 'Đơn vị đo không được để trống').max(20),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export function CreateMeterDialog({ children }: { children?: React.ReactNode }) {
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
      unit: 'kWh',
      type: 'ELECTRICITY'
    },
  })

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Thêm công tơ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Công Tơ Mới</DialogTitle>
          <DialogDescription>Tạo công tơ điện / nước cho các phòng chưa có.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Thuộc Phòng</Label>
            <Select onValueChange={(val) => setValue('roomId', Number(val))}>
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
            <Select defaultValue="ELECTRICITY" onValueChange={(val) => {
              setValue('type', val as 'ELECTRICITY' | 'WATER')
              setValue('unit', val === 'ELECTRICITY' ? 'kWh' : 'm3')
            }}>
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
            <Input
              id="unit"
              type="text"
              placeholder="VD: kWh, m3"
              {...register('unit')}
            />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit.message}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Thêm Công Tơ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
