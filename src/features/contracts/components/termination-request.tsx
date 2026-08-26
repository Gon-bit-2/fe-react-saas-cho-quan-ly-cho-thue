import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Clock, XCircle, AlertTriangle, Calculator, CalendarDays, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useActiveTerminationByContract, useCreateTermination, useCompleteTermination } from '@/shared/api/terminations'
import { useHandoversControllerList } from '@/shared/api/generated/handovers/handovers'
import { useInvoicesControllerListDebts } from '@/shared/api/generated/invoices/invoices'
import { useQueryClient } from '@tanstack/react-query'
import { LiquidationModal } from '@/features/tenant-app/pages/terminations/components/liquidation-modal'

interface TerminationRequestProps {
  contractId: number
  isLandlord: boolean
  depositAmount?: number
}

/**
 * Component quản lý quy trình yêu cầu kết thúc / thanh lý hợp đồng (gửi yêu cầu, duyệt, hoàn tất thanh lý và dự tính quyết toán)
 */
export function TerminationRequest({ contractId, isLandlord, depositAmount = 0 }: TerminationRequestProps) {
  const { data: request, isLoading: isLoadingRequest } = useActiveTerminationByContract(contractId, isLandlord)

  const status = request?.status || 'NONE'

  const [reason, setReason] = useState('')
  const [expectedMoveOutDate, setExpectedMoveOutDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: createTermination } = useCreateTermination(isLandlord)
  const queryClient = useQueryClient()
  const completeMutation = useCompleteTermination(request?.id || 0)

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)

  // Lấy danh sách handover để check Biên bản trả phòng (CHECKOUT)
  const { data: handoversResponse } = useHandoversControllerList(
    { contractId, limit: 10 },
    { query: { enabled: !!contractId && isLandlord } },
  )
  const handovers =
    (handoversResponse as unknown as { data: { type?: string; status?: string; id?: number }[] })?.data || []
  const checkoutHandover = handovers.find(
    (h: { type?: string; status?: string; id?: number }) => h?.type === 'CHECKOUT' && h?.status === 'CONFIRMED',
  )

  // Lấy tổng công nợ
  const { data: debtsResponse } = useInvoicesControllerListDebts({ contractId }, { query: { enabled: !!contractId && isLandlord } })
  const outstandingDebt = (debtsResponse as unknown as { totalRemainingAmount: number })?.totalRemainingAmount || 0

  // Giả lập trạng thái quy trình thanh lý
  const steps = [
    { id: 1, title: 'Gửi yêu cầu', status: status !== 'NONE' ? 'COMPLETED' : 'PENDING' },
    {
      id: 2,
      title: 'Xác nhận yêu cầu',
      status:
        status === 'PENDING'
          ? 'IN_PROGRESS'
          : status === 'APPROVED' || status === 'COMPLETED'
            ? 'COMPLETED'
            : status === 'REJECTED'
              ? 'REJECTED'
              : 'PENDING',
    },
    {
      id: 3,
      title: 'Bàn giao & Quyết toán',
      status: status === 'APPROVED' ? 'IN_PROGRESS' : status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
    },
    { id: 4, title: 'Kết thúc hợp đồng', status: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await createTermination({
        contractId: contractId,
        reason,
        expectedMoveOutDate,
      })
      toast.success('Đã gửi yêu cầu thanh lý')
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['/terminations/active', contractId] })
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingRequest) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {status === 'NONE' ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Yêu cầu kết thúc hợp đồng trước hạn
            </CardTitle>
            <CardDescription>
              Khi kết thúc hợp đồng trước hạn, bạn có thể bị mất một phần hoặc toàn bộ tiền cọc theo điều khoản hợp
              đồng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Lý do kết thúc ({isLandlord ? 'Chủ trọ' : 'Người thuê'})
              </label>
              <Textarea
                placeholder="Nhập lý do chi tiết..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ngày dự kiến dọn đi (Báo trước theo hợp đồng)
              </label>
              <Input
                type="date"
                value={expectedMoveOutDate}
                onChange={(e) => setExpectedMoveOutDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="mb-1 font-semibold">Lưu ý quyết toán</p>
                <ul className="list-disc space-y-1 pl-4 opacity-90">
                  <li>Tiền cọc có thể bị cấn trừ vào các khoản phí chưa thanh toán.</li>
                  <li>Nếu vi phạm thời gian báo trước, bạn sẽ bị phạt theo hợp đồng.</li>
                  <li>Cần hoàn thành biên bản bàn giao phòng trước khi thanh lý hợp đồng.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button variant="destructive" onClick={handleSubmit} disabled={!reason.trim() || isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu thanh lý'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-slate-800">Tiến trình thanh lý hợp đồng</CardTitle>
                    <CardDescription>Yêu cầu đang được xử lý</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    {status === 'PENDING'
                      ? 'Chờ duyệt'
                      : status === 'APPROVED'
                        ? 'Đã duyệt (Chờ hoàn tất)'
                        : status === 'COMPLETED'
                          ? 'Đã hoàn tất'
                          : 'Từ chối'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {/* Stepper */}
                <div className="relative">
                  <div className="absolute top-5 bottom-5 left-6 w-0.5 bg-slate-100"></div>
                  <div className="relative z-10 space-y-8">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                            step.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-white'
                              : step.status === 'IN_PROGRESS'
                                ? 'bg-blue-500 text-white'
                                : step.status === 'REJECTED'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step.status === 'COMPLETED' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : step.status === 'REJECTED' ? (
                            <XCircle className="h-5 w-5" />
                          ) : step.status === 'IN_PROGRESS' ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <span>{step.id}</span>
                          )}
                        </div>
                        <div className="pt-2">
                          <h4
                            className={`font-semibold ${step.status !== 'PENDING' ? 'text-slate-900' : 'text-slate-400'}`}
                          >
                            {step.title}
                          </h4>
                          {step.status === 'COMPLETED' && idx === 0 && (
                            <div className="mt-2 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                              <p>
                                <span className="font-medium">Người yêu cầu:</span>{' '}
                                {(request as unknown as { user?: { fullName?: string } })?.user?.fullName ||
                                  'Người thuê'}
                              </p>
                              <p>
                                <span className="font-medium">Lý do:</span> {request?.reason}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {request?.createdAt ? new Date(request.createdAt).toLocaleString('vi-VN') : ''}
                              </p>
                            </div>
                          )}
                          {/* Nút Duyệt chỉ show ở màn hình Danh sách duyệt (ReviewDialog) hoặc có thể show ở đây nếu muốn. Hiện tại ta ẩn đi để đồng bộ với mock */}
                          {step.status === 'IN_PROGRESS' && idx === 1 && isLandlord && (
                            <div className="mt-3 flex gap-2">
                              <span className="text-sm text-slate-500 italic">
                                Vui lòng duyệt yêu cầu ở trang Danh sách yêu cầu thanh lý.
                              </span>
                            </div>
                          )}
                          {step.status === 'IN_PROGRESS' && idx === 2 && isLandlord && (
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => setIsCompleteModalOpen(true)}
                              >
                                Hoàn tất thanh lý
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                  <Calculator className="h-5 w-5 text-slate-500" />
                  Dự tính quyết toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="text-slate-500">Tiền cọc ban đầu</span>
                  <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(depositAmount || 0)} ₫</span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="text-slate-500">Phạt vi phạm HĐ</span>
                  <span className="font-medium text-red-600">- 0 ₫</span>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <span className="text-slate-500">Hóa đơn chưa thanh toán</span>
                  <span className="font-medium text-red-600">- 0 ₫</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-semibold text-slate-900">Tiền cọc hoàn lại</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {new Intl.NumberFormat('vi-VN').format(depositAmount || 0)} ₫
                  </span>
                </div>

                <div className="mt-6 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Số tiền thực tế có thể thay đổi sau khi kiểm kê tài sản (nếu có hỏng hóc) và chốt chỉ số điện nước
                    cuối cùng.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <LiquidationModal 
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onComplete={async (data) => {
          if (checkoutHandover?.id) {
            try {
              await completeMutation.mutateAsync({
                checkoutHandoverId: checkoutHandover.id,
                actualMoveOutDate: data.actualMoveOutDate,
                completionNote: 'Đã thanh lý qua chức năng Quyết toán',
                acknowledgeOutstandingDebt: data.acknowledgeDebt,
                electricityFee: data.electricityFee,
                waterFee: data.waterFee,
                damageFee: data.damageFee,
                penaltyFee: data.penaltyFee,
              })
              setIsCompleteModalOpen(false)
              queryClient.invalidateQueries({ queryKey: ['/terminations/active', contractId] })
              queryClient.invalidateQueries({ queryKey: ['/contracts'] })
            } catch (error: unknown) {
              const err = error as Error & { response?: { data?: { message?: string } } }
              toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất thanh lý')
              throw error // Ném lỗi để LiquidationModal biết
            }
          } else {
            setIsCompleteModalOpen(false)
          }
        }}
        depositAmount={depositAmount || 0}
        contractId={String(contractId)}
        roomName={`Phòng thuê`}
      />
    </div>
  )
}
