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
import { useUtilityMetersControllerList, meterReadingsControllerCreate } from '../api'
import { Zap, Droplet, Loader2, Save, AlertCircle } from 'lucide-react'

const formSchema = z.object({
  meterId: z.coerce.number().int().positive('Vui lòng chọn công tơ'),
  billingMonth: z.string().nonempty('Vui lòng chọn tháng ghi chỉ số'),
  currentValue: z.coerce.number().nonnegative('Chỉ số mới không hợp lệ'),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

interface RecordReadingDialogProps {
  children?: React.ReactNode
  /** Công tơ cụ thể nếu mở từ trang chi tiết công tơ */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meter?: Record<string, any>
}

/**
 * Hộp thoại ghi chỉ số đơn lẻ cho công tơ điện hoặc nước.
 * Tự động đối chiếu với chỉ số cũ và tính toán mức tiêu thụ tạm tính.
 */
export function RecordReadingDialog({ children, meter }: RecordReadingDialogProps) {
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
    control,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meterId: meter?.id,
      billingMonth: new Date().toISOString().substring(0, 7) + '-01',
    },
  })

  const selectedMeterId = useWatch({ control, name: 'meterId' })
  const currentValue = useWatch({ control, name: 'currentValue' })
  const activeMeter = meter || meters.find((m) => m.id === Number(selectedMeterId))

  const previousValue = activeMeter?.readings?.[0]?.currentValue ?? activeMeter?.initialValue ?? 0
  const isElectricity = activeMeter?.type === 'ELECTRICITY'
  const unitLabel = activeMeter?.unit || (isElectricity ? 'kWh' : 'm³')

  const consumption = useMemo(() => {
    if (currentValue === undefined || currentValue === null || isNaN(Number(currentValue))) return null
    return Number(currentValue) - Number(previousValue)
  }, [currentValue, previousValue])

  const { mutate: createReading, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof meterReadingsControllerCreate>[0]) =>
      meterReadingsControllerCreate(data),
    onSuccess: () => {
      toast.success('Ghi nhận chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      queryClient.invalidateQueries({ queryKey: ['utility-meters'] })
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
      status: consumption !== null && consumption < 0 ? 'ABNORMAL' : 'DRAFT',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
            Ghi chỉ số
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Ghi Chỉ Số Tiện Ích
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Nhập chỉ số đọc được từ đồng hồ đo điện hoặc nước sinh hoạt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Chọn tháng chốt */}
          <div className="space-y-1.5">
            <Label htmlFor="billingMonth" className="text-xs font-semibold text-slate-700">
              Kỳ tính tiền *
            </Label>
            <Input
              id="billingMonth"
              type="month"
              className="h-9 text-sm"
              defaultValue={new Date().toISOString().substring(0, 7)}
              onChange={(e) => {
                setValue('billingMonth', e.target.value ? `${e.target.value}-01` : '')
              }}
            />
            {errors.billingMonth && (
              <p className="text-xs text-rose-500">{errors.billingMonth.message}</p>
            )}
          </div>

          {/* Chọn công tơ nếu chưa có */}
          {!meter && (
            <div className="space-y-1.5">
              <Label htmlFor="meterId" className="text-xs font-semibold text-slate-700">
                Công tơ *
              </Label>
              <Select onValueChange={(val) => setValue('meterId', Number(val))}>
                <SelectTrigger className="h-9 bg-slate-50 text-xs">
                  <SelectValue placeholder={isLoadingMeters ? 'Đang tải...' : 'Chọn công tơ'} />
                </SelectTrigger>
                <SelectContent>
                  {meters.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()} className="text-xs">
                      {m.meterCode} - Phòng {m.room?.roomCode} ({m.type === 'ELECTRICITY' ? 'Điện' : 'Nước'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.meterId && <p className="text-xs text-rose-500">{errors.meterId.message}</p>}
            </div>
          )}

          {/* Card thông tin đối chiếu */}
          {activeMeter && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isElectricity ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isElectricity ? <Zap className="h-4 w-4" /> : <Droplet className="h-4 w-4" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{activeMeter.meterCode}</div>
                  <div className="text-slate-500">Phòng {activeMeter.room?.roomCode}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Số cũ:</span>{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {previousValue?.toLocaleString('vi-VN')} {unitLabel}
                </strong>
              </div>
            </div>
          )}

          {/* Nhập chỉ số mới */}
          <div className="space-y-1.5">
            <Label htmlFor="currentValue" className="text-xs font-semibold text-slate-700">
              Chỉ số mới ({unitLabel}) *
            </Label>
            <Input
              id="currentValue"
              type="number"
              min="0"
              step="any"
              placeholder="Nhập số trên đồng hồ..."
              className="h-10 font-mono text-base font-bold tabular-nums"
              {...register('currentValue')}
            />
            {errors.currentValue && (
              <p className="text-xs text-rose-500">{errors.currentValue.message}</p>
            )}
          </div>

          {/* Tính toán mức tiêu thụ */}
          {consumption !== null && !isNaN(consumption) && (
            <div className={`rounded-lg border p-3 text-xs flex items-center gap-2 ${
              consumption < 0
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-blue-100 bg-blue-50/60 text-blue-700'
            }`}>
              {consumption < 0 ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              ) : (
                <Save className="h-4 w-4 shrink-0 text-blue-600" />
              )}
              <span>
                Tiêu thụ:{' '}
                <strong className="font-mono tabular-nums text-slate-900 font-bold">
                  {consumption.toLocaleString('vi-VN')} {unitLabel}
                </strong>
                {consumption < 0 && ' (Cảnh báo: Chỉ số mới nhỏ hơn chỉ số cũ)'}
              </span>
            </div>
          )}

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
              disabled={isPending || !activeMeter}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isPending ? 'Đang lưu...' : 'Lưu chỉ số'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
