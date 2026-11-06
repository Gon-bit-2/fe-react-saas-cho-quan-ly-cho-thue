import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { paymentsControllerRecordManualPayment } from '@/shared/api/generated/payments/payments'
import { formatCurrency } from '@/shared/lib/utils'
import { CreditCard, Loader2, Banknote, QrCode, Wallet, Check } from 'lucide-react'

type ManualPaymentFormValues = {
  amount: number
  method: 'CASH' | 'BANK_TRANSFER' | 'WALLET'
  note?: string
}

type Props = {
  invoiceId: number
  remainingAmount: number
  trigger?: React.ReactNode
}

/**
 * Hộp thoại ghi nhận thanh toán thủ công (tiền mặt hoặc chuyển khoản ngoài hệ thống).
 * Hỗ trợ nút điền nhanh toàn bộ số nợ và cập nhật trạng thái hóa đơn ngay lập tức.
 */
export function ManualPaymentDialog({ invoiceId, remainingAmount, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: recordPayment, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof paymentsControllerRecordManualPayment>[1]) =>
      paymentsControllerRecordManualPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Ghi nhận khoản thanh toán thành công')
      setOpen(false)
      reset()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi ghi nhận thanh toán')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm<ManualPaymentFormValues>({
    defaultValues: {
      amount: remainingAmount,
      method: 'CASH',
      note: '',
    },
  })

  const method = useWatch({ control, name: 'method' })

  const onSubmit = (data: ManualPaymentFormValues) => {
    if (data.amount > remainingAmount) {
      toast.error('Số tiền thanh toán không được vượt quá số nợ còn lại')
      return
    }

    recordPayment({
      amount: Number(data.amount),
      method: data.method,
      note: data.note,
      paidAt: new Date().toISOString(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Thu tiền phòng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Ghi Nhận Thu Tiền Phòng</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Nhập số tiền đã nhận từ khách thuê qua tiền mặt hoặc tài khoản cá nhân.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Thông tin số nợ & Nút chọn nhanh */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
            <span className="text-slate-600">Số tiền còn nợ:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-rose-600 tabular-nums">{formatCurrency(remainingAmount)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue('amount', remainingAmount)}
                className="h-6 px-2 text-[11px] font-medium text-blue-600 hover:bg-blue-50"
              >
                Trả hết
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-semibold text-slate-700">
              Số tiền thu thực tế (VNĐ) *
            </Label>
            <Input
              id="amount"
              type="number"
              min="1000"
              step="1000"
              className="h-10 font-mono text-base font-bold tabular-nums"
              {...register('amount', { required: 'Vui lòng nhập số tiền', min: 1 })}
              placeholder="VD: 2500000"
            />
            {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Phương thức thanh toán *</Label>
            <Select
              value={method}
              onValueChange={(val: 'CASH' | 'BANK_TRANSFER' | 'WALLET') => setValue('method', val)}
            >
              <SelectTrigger className="h-9 bg-slate-50 text-xs">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600" /> Tiền mặt trực tiếp
                  </span>
                </SelectItem>
                <SelectItem value="BANK_TRANSFER" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-blue-600" /> Chuyển khoản ngân hàng ngoài
                  </span>
                </SelectItem>
                <SelectItem value="WALLET" className="text-xs">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-purple-600" /> Ví điện tử (Momo/ZaloPay)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs font-semibold text-slate-700">
              Ghi chú phiếu thu
            </Label>
            <Textarea
              id="note"
              placeholder="Ví dụ: Khách trả trước một phần, phần còn lại hẹn cuối tuần..."
              className="h-20 resize-none text-xs"
              {...register('note')}
            />
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 text-xs">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {isPending ? 'Đang lưu...' : 'Xác nhận thu tiền'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
