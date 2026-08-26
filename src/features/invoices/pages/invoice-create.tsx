import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { InvoiceItemType, InvoiceStatus } from '../types'
import type { CreateInvoiceDto } from '../types'
import { createInvoice } from '../api'
import { useContracts } from '@/shared/api/contracts'
import { customInstance } from '@/shared/api/orval-mutator'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useUtilityMetersControllerList } from '@/shared/api/generated/utility-meters/utility-meters'
import { OcrUploadDialog } from '@/features/utilities/components/ocr-upload-dialog'

type InvoiceCreateFormValues = CreateInvoiceDto & {
  extraItems: NonNullable<CreateInvoiceDto['extraItems']>
}

type InvoicePreviewData = {
  contract?: {
    roomCode?: string
  }
  billingMonth?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }[]
  totals: {
    subtotal: number
    discountAmount: number
    penaltyAmount: number
    totalAmount: number
  }
}

export function InvoiceCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewData, setPreviewData] = useState<InvoicePreviewData | null>(null)
  const [pendingData, setPendingData] = useState<CreateInvoiceDto | null>(null)
  
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false)
  const [selectedMeterForOcr, setSelectedMeterForOcr] = useState<{ id: number; name: string } | null>(null)

  const { data: contractsResponse, isLoading: isLoadingContracts } = useContracts({ limit: 100 })
  const contracts = contractsResponse?.data || []

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceCreateFormValues>({
    defaultValues: {
      contractId: undefined,
      billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      status: InvoiceStatus.UNPAID,
      extraItems: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extraItems',
  })
  // eslint-disable-next-line react-hooks/incompatible-library
  const extraItems = watch('extraItems') || []
  
  const selectedContractId = watch('contractId')
  const selectedContract = contracts.find((c: { id: number; roomId: number }) => c.id === selectedContractId)
  const currentBillingMonth = watch('billingMonth')

  const { data: metersResponse } = useUtilityMetersControllerList(
    { roomId: selectedContract?.roomId, status: 'ACTIVE' },
    { query: { enabled: !!selectedContract?.roomId } }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomMeters = (metersResponse as unknown as { data?: Array<any> })?.data || []

  const additions = extraItems
    .filter((item) => item.itemType === InvoiceItemType.PENALTY || item.itemType === InvoiceItemType.OTHER)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0)

  const deductions = extraItems
    .filter((item) => item.itemType === InvoiceItemType.DISCOUNT)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0)

  const onSubmit = async (data: CreateInvoiceDto) => {
    if (!data.contractId) {
      toast.error('Vui lòng chọn hợp đồng!')
      return
    }
    setIsSubmitting(true)
    try {
      const formattedData = {
        ...data,
        billingMonth: `${data.billingMonth}-01T00:00:00Z`,
      }
      const response = await customInstance<InvoicePreviewData>({
        url: '/invoices/preview',
        method: 'POST',
        data: formattedData,
      })
      setPreviewData(response)
      setPendingData(formattedData)
    } catch (error: unknown) {
      console.error('Failed to load invoice preview:', error)
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined
      toast.error(message || 'Có lỗi xảy ra khi tính toán hóa đơn')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmCreate = async () => {
    if (!pendingData) return
    setIsSubmitting(true)
    try {
      await createInvoice(pendingData)
      toast.success('Đã tạo hóa đơn thành công!')
      navigate('/hoa-don')
    } catch (error: unknown) {
      console.error('Failed to create invoice:', error)
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined
      toast.error(message || 'Có lỗi xảy ra khi tạo hóa đơn')
    } finally {
      setIsSubmitting(false)
      setPreviewData(null)
      setPendingData(null)
    }
  }

  const handleSaveDraft = async () => {
    setValue('status', InvoiceStatus.DRAFT)
    handleSubmit(onSubmit)()
  }

  return (
    <div className="bg-background flex h-full min-h-[calc(100vh-64px)] w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tạo Hóa Đơn</h1>
          <p className="mt-1 text-slate-500">Tạo hóa đơn mới dựa trên hợp đồng và chỉ số sử dụng.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            Lưu Nháp
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            Phát Hành Hóa Đơn
          </Button>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          {/* Section: Thông tin chung */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <span className="material-symbols-outlined text-primary">description</span>
              Thông Tin Hóa Đơn
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Hợp đồng / Phòng</Label>
                <Select onValueChange={(val) => setValue('contractId', Number(val))}>
                  <SelectTrigger disabled={isLoadingContracts}>
                    <SelectValue placeholder={isLoadingContracts ? 'Đang tải...' : 'Chọn hợp đồng...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.contractCode} - {contract.room?.title || `Phòng ${contract.roomId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Kỳ Hóa Đơn (Tháng)</Label>
                <Input type="month" {...register('billingMonth', { required: true })} />
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <span className="material-symbols-outlined mt-0.5">info</span>
              <div>
                <strong>Lưu ý:</strong> Tiền thuê cơ bản, phí dịch vụ (điện, nước, rác...) sẽ được hệ thống{' '}
                <strong>tự động tính toán</strong> dựa trên hợp đồng và chỉ số chốt của tháng tương ứng khi bạn tạo hóa
                đơn.
              </div>
            </div>
          </div>

          {/* Section: Chỉ số công tơ */}
          {selectedContract && roomMeters.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
                <span className="material-symbols-outlined text-primary">speed</span>
                Chỉ Số Điện/Nước Tháng Này
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {roomMeters.map((meter) => (
                  <div key={meter.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">
                        {meter.type === 'ELECTRICITY' ? '⚡ Điện' : '💧 Nước'} - {meter.meterCode}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedMeterForOcr({
                          id: meter.id,
                          name: `${meter.type === 'ELECTRICITY' ? 'Điện' : 'Nước'} - ${meter.meterCode}`,
                        })
                        setOcrDialogOpen(true)
                      }}
                    >
                      <span className="material-symbols-outlined mr-2 text-[18px]">camera_alt</span>
                      Cập nhật chỉ số
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Điều chỉnh */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <span className="material-symbols-outlined text-primary">tune</span>
              Điều Chỉnh Khác (Tùy Chọn)
            </h2>

            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <Select onValueChange={(val) => setValue(`extraItems.${index}.itemType`, val as InvoiceItemType)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InvoiceItemType.PENALTY}>Phạt</SelectItem>
                      <SelectItem value={InvoiceItemType.OTHER}>Phí khác</SelectItem>
                      <SelectItem value={InvoiceItemType.DISCOUNT}>Giảm giá</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    className="flex-1"
                    placeholder="Mô tả"
                    {...register(`extraItems.${index}.description` as const, { required: true })}
                  />

                  <div className="flex w-32 items-center gap-2">
                    <Input
                      type="number" min="0"
                      className="text-right"
                      placeholder="Số tiền"
                      {...register(`extraItems.${index}.unitPrice` as const, {
                        valueAsNumber: true,
                        required: true,
                        min: 0,
                      })}
                    />
                    <span className="text-sm text-slate-500">₫</span>
                  </div>

                  <input
                    type="hidden"
                    {...register(`extraItems.${index}.quantity` as const, { valueAsNumber: true, value: 1 })}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => remove(index)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </Button>
                </div>
              ))}

              <Button
                variant="ghost"
                className="text-primary self-start hover:text-blue-700"
                onClick={() => append({ itemType: InvoiceItemType.OTHER, description: '', quantity: 1, unitPrice: 0 })}
              >
                <span className="material-symbols-outlined mr-1">add</span>
                Thêm khoản mục
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full shrink-0 lg:w-[380px]">
          <div className="bg-primary relative sticky top-6 overflow-hidden rounded-xl p-6 text-white shadow-md">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <h2 className="relative z-10 mb-6 text-xl font-bold">Tạm Tính Phụ Phí</h2>

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between text-green-300 opacity-90">
                <span>Phát Sinh Thêm</span>
                <span>+ {additions.toLocaleString()} ₫</span>
              </div>
              <div className="flex items-center justify-between text-red-300 opacity-90">
                <span>Giảm Trừ</span>
                <span>- {deductions.toLocaleString()} ₫</span>
              </div>
            </div>

            <div className="relative z-10 my-4 h-px w-full bg-white/20"></div>

            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-xs tracking-wider uppercase opacity-80">Tổng Cộng Phụ Phí</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{(additions - deductions).toLocaleString()}</span>
                <span className="text-xl opacity-80">₫</span>
              </div>
              <span className="mt-2 block text-xs opacity-80">
                * Hệ thống sẽ cộng thêm tiền thuê cơ bản và chi phí điện/nước/dịch vụ khi xuất hóa đơn.
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedMeterForOcr && currentBillingMonth && (
        <OcrUploadDialog
          open={ocrDialogOpen}
          onOpenChange={setOcrDialogOpen}
          meterId={selectedMeterForOcr.id}
          meterName={selectedMeterForOcr.name}
          billingMonth={`${currentBillingMonth}-01T00:00:00Z`}
          onSuccess={() => {
            // Khi ghi chỉ số thành công, nếu đang preview thì tính lại preview
            if (pendingData) {
              onSubmit(pendingData)
            }
          }}
        />
      )}

      <Dialog open={!!previewData} onOpenChange={(v) => !v && setPreviewData(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xác nhận Hóa Đơn</DialogTitle>
            <DialogDescription>Vui lòng kiểm tra kỹ các khoản mục hóa đơn trước khi phát hành.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">Mã hợp đồng: {previewData?.contract?.roomCode}</h3>
              <p className="text-sm text-slate-500">
                Kỳ hóa đơn:{' '}
                {previewData?.billingMonth
                  ? new Date(previewData.billingMonth).toLocaleDateString('vi-VN', {
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : ''}
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-2 font-medium">Khoản mục</th>
                    <th className="px-4 py-2 text-right font-medium">Số lượng</th>
                    <th className="px-4 py-2 text-right font-medium">Đơn giá</th>
                    <th className="px-4 py-2 text-right font-medium">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(previewData?.items || []).map((item, idx: number) => (
                    <tr key={idx} className="bg-white">
                      <td className="px-4 py-2 text-slate-800">{item.description}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {Number(item.unitPrice).toLocaleString()} ₫
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">
                        {Number(item.amount).toLocaleString()} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-primary/5 border-primary/10 flex flex-col items-end gap-1 rounded-lg border p-4 text-base">
              <div className="flex w-64 justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span>{Number(previewData?.totals?.subtotal || 0).toLocaleString()} ₫</span>
              </div>
              {Number(previewData?.totals?.discountAmount || 0) > 0 && (
                <div className="flex w-64 justify-between text-green-600">
                  <span>Giảm trừ:</span>
                  <span>- {Number(previewData?.totals?.discountAmount).toLocaleString()} ₫</span>
                </div>
              )}
              {Number(previewData?.totals?.penaltyAmount || 0) > 0 && (
                <div className="flex w-64 justify-between text-red-500">
                  <span>Phụ phí phạt:</span>
                  <span>+ {Number(previewData?.totals?.penaltyAmount).toLocaleString()} ₫</span>
                </div>
              )}
              <div className="text-primary border-primary/20 mt-2 flex w-64 justify-between border-t pt-2 text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{Number(previewData?.totals?.totalAmount || 0).toLocaleString()} ₫</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setPreviewData(null)} disabled={isSubmitting}>
              Quay lại chỉnh sửa
            </Button>
            <Button onClick={confirmCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Phát hành chính thức'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
