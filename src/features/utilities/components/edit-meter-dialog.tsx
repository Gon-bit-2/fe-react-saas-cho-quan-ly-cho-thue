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
import { Edit3, Loader2, Zap, Droplet } from 'lucide-react'

const formSchema = z.object({
  meterCode: z.string().trim().min(1, 'Mã công tơ không được để trống').max(100),
  unit: z.string().trim().min(1, 'Đơn vị đo không được để trống').max(20),
  status: z.enum(['ACTIVE', 'BROKEN', 'INACTIVE']).optional(),
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
  room?: { roomCode?: string }
}

/**
 * Hộp thoại chỉnh sửa thông tin cấu hình công tơ điện / nước.
 * Hỗ trợ cập nhật mã số, đơn vị tính và trạng thái hoạt động của công tơ.
 */
export function EditMeterDialog({ children, meter }: { children?: React.ReactNode; meter: MeterData }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meterCode: meter.serialNumber || meter.meterCode || '',
      unit: meter.unit || (meter.type === 'ELECTRICITY' ? 'kWh' : 'm³'),
      status: (meter.status as 'ACTIVE' | 'BROKEN' | 'INACTIVE') || 'ACTIVE',
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
      status: data.status,
    })
  }

  const isElectricity = meter.type === 'ELECTRICITY'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5" /> Sửa thông tin
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Chỉnh Sửa Thông Tin Công Tơ
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Cập nhật mã thiết bị hoặc chuyển trạng thái hoạt động của công tơ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Thông tin phòng & loại cố định */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isElectricity ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isElectricity ? <Zap className="h-4 w-4" /> : <Droplet className="h-4 w-4" />}
              </div>
              <span className="font-semibold text-slate-900">
                {isElectricity ? 'Công tơ điện' : 'Công tơ nước'}
              </span>
            </div>
            <span>
              Phòng: <strong className="text-slate-900">{meter.room?.roomCode || meter.roomId || 'Chưa gán'}</strong>
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meterCode" className="text-xs font-semibold text-slate-700">
              Mã / Serial công tơ *
            </Label>
            <Input
              id="meterCode"
              type="text"
              className="h-9 text-sm"
              placeholder="VD: CT-D-101"
              {...register('meterCode')}
            />
            {errors.meterCode && <p className="text-xs text-rose-500">{errors.meterCode.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="unit" className="text-xs font-semibold text-slate-700">
                Đơn vị đo *
              </Label>
              <Input id="unit" type="text" className="h-9 text-sm" {...register('unit')} />
              {errors.unit && <p className="text-xs text-rose-500">{errors.unit.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Trạng thái</Label>
              <Select
                defaultValue={meter.status || 'ACTIVE'}
                onValueChange={(val) => setValue('status', val as 'ACTIVE' | 'BROKEN' | 'INACTIVE')}
              >
                <SelectTrigger className="h-9 bg-slate-50 text-xs">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-xs">Hoạt động</SelectItem>
                  <SelectItem value="BROKEN" className="text-xs">Báo hỏng / Cần sửa</SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-9 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
