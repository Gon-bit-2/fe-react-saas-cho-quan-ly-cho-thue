import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

export function ManualPaymentDialog({ invoiceId, remainingAmount, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: recordPayment, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof paymentsControllerRecordManualPayment>[1]) =>
      paymentsControllerRecordManualPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Ghi nhận thanh toán thành công')
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
    watch,
    reset,
  } = useForm<ManualPaymentFormValues>({
    defaultValues: {
      amount: remainingAmount,
      method: 'CASH',
      note: '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const method = watch('method')

  const onSubmit = (data: ManualPaymentFormValues) => {
    if (data.amount > remainingAmount) {
      toast.error('Số tiền thanh toán không được lớn hơn công nợ còn lại')
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
          <Button variant="outline" className="w-full justify-start text-slate-700">
            <span className="material-symbols-outlined mr-2 text-[18px]">payments</span>
            Thanh toán thủ công
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ghi nhận Thanh toán Thủ công</DialogTitle>
          <DialogDescription>
            Nhập thông tin giao dịch bằng tiền mặt hoặc chuyển khoản trực tiếp bên ngoài hệ thống.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">
              Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { required: 'Vui lòng nhập số tiền', min: 1 })}
              placeholder="VD: 500000"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            <p className="text-xs text-slate-500">Công nợ hiện tại: {remainingAmount.toLocaleString('vi-VN')} đ</p>
          </div>

          <div className="space-y-2">
            <Label>
              Phương thức thanh toán <span className="text-red-500">*</span>
            </Label>
            <Select
              value={method}
              onValueChange={(val: 'CASH' | 'BANK_TRANSFER' | 'WALLET') => setValue('method', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="BANK_TRANSFER">Chuyển khoản ngoài</SelectItem>
                <SelectItem value="WALLET">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Ghi chú về khoản thanh toán này (vd: Khách trả tiền mặt 500k, còn nợ 200k)"
              {...register('note')}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
