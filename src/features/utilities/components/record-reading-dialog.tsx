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
import { useUtilityMetersControllerList, meterReadingsControllerCreate } from '../api'

const formSchema = z.object({
  meterId: z.coerce.number().int().positive('Vui lòng chọn công tơ'),
  billingMonth: z.string().nonempty('Vui lòng chọn tháng ghi chỉ số'),
  currentValue: z.coerce.number().nonnegative('Chỉ số mới không hợp lệ'),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export function RecordReadingDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: metersResponse, isLoading: isLoadingMeters } = useUtilityMetersControllerList({
    limit: 100,
    status: 'ACTIVE',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meters = (metersResponse as unknown as { data?: Array<any> })?.data || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingMonth: new Date().toISOString().substring(0, 7) + '-01',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedMeterId = watch('meterId')
  const selectedMeter = meters.find((m) => m.id === selectedMeterId)

  const { mutate: createReading, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof meterReadingsControllerCreate>[0]) => meterReadingsControllerCreate(data),
    onSuccess: () => {
      toast.success('Ghi chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      setOpen(false)
      reset()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; errors?: unknown } } }
      console.error('Lỗi API:', err.response?.data)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi ghi chỉ số')
    },
  })

  const onSubmit = (data: FormValues) => {
    createReading({
      meterId: data.meterId,
      billingMonth: new Date(data.billingMonth).toISOString(),
      currentValue: data.currentValue,
      status: 'DRAFT',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ghi Chỉ Số</DialogTitle>
          <DialogDescription>Nhập chỉ số điện / nước mới cho công tơ.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="billingMonth">Kỳ ghi chỉ số</Label>
            <Input
              id="billingMonth"
              type="month"
              defaultValue={new Date().toISOString().substring(0, 7)}
              onChange={(e) => {
                setValue('billingMonth', e.target.value ? `${e.target.value}-01` : '')
              }}
            />
            {errors.billingMonth && <p className="text-sm text-red-500">{errors.billingMonth.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterId">Công Tơ</Label>
            <Select onValueChange={(val) => setValue('meterId', Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingMeters ? 'Đang tải...' : 'Chọn công tơ'} />
              </SelectTrigger>
              <SelectContent>
                {meters.map((meter) => (
                  <SelectItem key={meter.id} value={meter.id.toString()}>
                    {meter.meterCode} - Phòng {meter.room?.roomCode} ({meter.type === 'ELECTRICITY' ? 'Điện' : 'Nước'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.meterId && <p className="text-sm text-red-500">{errors.meterId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentValue">Chỉ số mới {selectedMeter?.unit ? `(${selectedMeter.unit})` : ''}</Label>
            <Input
              id="currentValue"
              type="number"
              min="0"
              step="any"
              placeholder="Nhập chỉ số trên đồng hồ"
              {...register('currentValue')}
            />
            {errors.currentValue && <p className="text-sm text-red-500">{errors.currentValue.message}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu Chỉ Số'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
