import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle, AlertTriangle, Calculator, CalendarDays, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useActiveTerminationByContract, useCreateTermination, useCompleteTermination } from '@/shared/api/terminations'
import { useHandoversControllerList } from '@/shared/api/generated/handovers/handovers'
import { useInvoicesControllerListDebts } from '@/shared/api/generated/invoices/invoices'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface TerminationRequestProps {
  contractId: number
  isLandlord: boolean
  depositAmount?: number
}

/**
 * Component quản lý quy trình yêu cầu kết thúc / thanh lý hợp đồng (gửi yêu cầu, duyệt, hoàn tất thanh lý và dự tính quyết toán)
 */
export function TerminationRequest({ contractId, isLandlord, depositAmount = 0 }: TerminationRequestProps) {
  const { data: request, isLoading: isLoadingRequest } = useActiveTerminationByContract(contractId)
  
  const status = request?.status || 'NONE'
  
  const [reason, setReason] = useState('')
  const { mutateAsync: createTermination, isPending: isSubmitting } = useCreateTermination()
  const completeMutation = useCompleteTermination(request?.id || 0)

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [actualMoveOutDate, setActualMoveOutDate] = useState(new Date().toISOString().split('T')[0])
  const [completionNote, setCompletionNote] = useState('')
  const [acknowledgeDebt, setAcknowledgeDebt] = useState(false)

  // Lấy danh sách handover để check Biên bản trả phòng (CHECKOUT)
  const { data: handoversResponse } = useHandoversControllerList(
    { contractId, limit: 10 },
    { query: { enabled: !!contractId } }
  )
  const handovers = (handoversResponse as any)?.data || []
  const checkoutHandover = handovers.find((h: any) => h.type === 'CHECKOUT' && h.status === 'CONFIRMED')

  // Lấy tổng công nợ
  const { data: debtsResponse } = useInvoicesControllerListDebts(
    { contractId },
    { query: { enabled: !!contractId } }
  )
  const outstandingDebt = (debtsResponse as any)?.totalRemainingAmount || 0

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
      await createMutation.mutateAsync({
        contractId: contractId,
        reason,
        expectedMoveOutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

  const handleCancel = async () => {
    if (!request) return
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) return
    try {
      await cancelMutation.mutateAsync({ id: request.id })
      toast.success('Đã hủy yêu cầu thanh lý')
      queryClient.invalidateQueries({ queryKey: ['/terminations/active', contractId] })
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleComplete = async () => {
    if (!request) return
    try {
      if (!checkoutHandover?.id) {
        toast.error('Vui lòng hoàn thành Biên bản trả phòng (CHECKOUT) trước khi thanh lý.')
        return
      }
      if (outstandingDebt > 0 && !acknowledgeDebt) {
        toast.error('Vui lòng xác nhận bỏ qua công nợ hoặc thanh toán hết hóa đơn.')
        return
      }
      if (outstandingDebt > 0 && !completionNote.trim()) {
        toast.error('Vui lòng nhập ghi chú quyết toán khi bỏ qua công nợ.')
        return
      }
      await completeMutation.mutateAsync({
        id: request.id,
        data: {
          checkoutHandoverId: checkoutHandover.id,
          actualMoveOutDate,
          completionNote,
          acknowledgeOutstandingDebt: acknowledgeDebt,
        }
      })
      toast.success('Đã hoàn tất thanh lý hợp đồng')
      setIsCompleteModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['/terminations/active', contractId] })
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất thanh lý')
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
                    {status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt (Chờ hoàn tất)' : status === 'COMPLETED' ? 'Đã hoàn tất' : 'Từ chối'}
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
                                <span className="font-medium">Người yêu cầu:</span> {request?.user?.fullName || 'Người thuê'}
                              </p>
                              <p>
                                <span className="font-medium">Lý do:</span> {request?.reason}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">{new Date(request?.createdAt || Date.now()).toLocaleString('vi-VN')}</p>
                            </div>
                          )}
                          {/* Nút Duyệt chỉ show ở màn hình Danh sách duyệt (ReviewDialog) hoặc có thể show ở đây nếu muốn. Hiện tại ta ẩn đi để đồng bộ với mock */}
                          {step.status === 'IN_PROGRESS' && idx === 1 && isLandlord && (
                            <div className="mt-3 flex gap-2">
                              <span className="text-sm text-slate-500 italic">Vui lòng duyệt yêu cầu ở trang Danh sách yêu cầu thanh lý.</span>
                            </div>
                          )}
                          {step.status === 'IN_PROGRESS' && idx === 2 && isLandlord && (
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCompleteModalOpen(true)}>
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

      {/* Modal Hoàn tất thanh lý */}
      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hoàn tất thanh lý hợp đồng</DialogTitle>
            <DialogDescription>
              Bước này sẽ chính thức kết thúc hợp đồng. Vui lòng đảm bảo bạn đã hoàn thành biên bản bàn giao phòng và chốt điện nước.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!checkoutHandover && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Chưa có Biên bản trả phòng (CHECKOUT) đã xác nhận. Vui lòng sang tab <b>Bàn giao</b> để tạo.
              </div>
            )}
            
            {outstandingDebt > 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Hợp đồng này đang còn nợ <b>{new Intl.NumberFormat('vi-VN').format(outstandingDebt)} ₫</b>.
              </div>
            )}
            <div className="space-y-2">
              <Label>Ngày dọn đi thực tế</Label>
              <input 
                type="date" 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={actualMoveOutDate}
                onChange={(e) => setActualMoveOutDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú quyết toán (Tùy chọn)</Label>
              <Textarea
                placeholder="Nhập ghi chú hoặc biên bản..."
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
              />
            </div>
            {outstandingDebt > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                <input 
                  type="checkbox" 
                  id="ack-debt" 
                  className="rounded border-slate-300"
                  checked={acknowledgeDebt}
                  onChange={(e) => setAcknowledgeDebt(e.target.checked)}
                />
                <Label htmlFor="ack-debt" className="text-sm font-medium text-amber-700">
                  Tôi xác nhận bỏ qua công nợ này để hoàn tất
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleComplete} 
              disabled={completeMutation.isPending || !checkoutHandover || (outstandingDebt > 0 && !acknowledgeDebt)} 
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {completeMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Xác nhận hoàn tất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
