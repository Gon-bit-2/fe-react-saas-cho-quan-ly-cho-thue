import { useState } from 'react'
import { useTerminations, useApproveTermination, useRejectTermination } from '@/shared/api/terminations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ContractTerminationRequest } from '@/types/termination'

const statusMap: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
}

export default function TerminationList() {
  const { data, isLoading } = useTerminations()

  const [selectedRequest, setSelectedRequest] = useState<ContractTerminationRequest | null>(null)

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu kết thúc hợp đồng</h1>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-lg">Danh sách yêu cầu thanh lý / trả phòng</CardTitle>
          <CardDescription>Các yêu cầu kết thúc hợp đồng từ người thuê</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Mã HĐ</TableHead>
                <TableHead className="font-semibold text-slate-700">Ngày yêu cầu</TableHead>
                <TableHead className="font-semibold text-slate-700">Ngày dọn đi (Dự kiến)</TableHead>
                <TableHead className="w-[300px] font-semibold text-slate-700">Lý do trả phòng</TableHead>
                <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Không có yêu cầu kết thúc hợp đồng nào.
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-blue-600">#{item.contractId}</TableCell>
                  <TableCell>{new Date(item.requestedDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {new Date(item.desiredEndDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-slate-600" title={item.reason}>
                      {item.reason}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'PENDING'
                          ? 'secondary'
                          : item.status === 'APPROVED'
                            ? 'default'
                            : item.status === 'COMPLETED'
                              ? 'default'
                              : item.status === 'REJECTED'
                                ? 'destructive'
                                : 'outline'
                      }
                      className={
                        item.status === 'APPROVED' || item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : ''
                      }
                    >
                      {statusMap[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'PENDING' ? (
                      <Button size="sm" onClick={() => setSelectedRequest(item)}>
                        Xét duyệt
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setSelectedRequest(item)}>
                        Xem chi tiết
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRequest && (
        <ReviewDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}
    </div>
  )
}

function ReviewDialog({
  request,
  open,
  onOpenChange,
}: {
  request: ContractTerminationRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [note, setNote] = useState(request.notes || '')

  const approveMutation = useApproveTermination(request.id)
  const rejectMutation = useRejectTermination(request.id)

  const isPendingStatus = request.status === 'PENDING'
  const isMutating = approveMutation.isPending || rejectMutation.isPending

  const handleApprove = () => {
    approveMutation.mutate(
      { reviewNote: note },
      {
        onSuccess: () => {
          toast.success('Đã duyệt yêu cầu kết thúc hợp đồng!')
          onOpenChange(false)
        },
        onError: () => toast.error('Lỗi khi duyệt yêu cầu'),
      },
    )
  }

  const handleReject = () => {
    if (!note.trim()) {
      toast.error('Vui lòng nhập lý do từ chối vào phần Ghi chú duyệt')
      return
    }
    rejectMutation.mutate(
      { reviewNote: note },
      {
        onSuccess: () => {
          toast.success('Đã từ chối yêu cầu kết thúc hợp đồng.')
          onOpenChange(false)
        },
        onError: () => toast.error('Lỗi khi từ chối yêu cầu'),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu Thanh lý hợp đồng #{request.contractId}</DialogTitle>
          <DialogDescription>Khách thuê yêu cầu kết thúc hợp đồng và trả phòng.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Ngày yêu cầu</p>
              <p className="mt-1 font-medium">{new Date(request.requestedDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Ngày dọn đi (Dự kiến)</p>
              <p className="mt-1 font-medium text-blue-600">
                {new Date(request.desiredEndDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Lý do trả phòng</p>
              <p className="mt-1 text-sm text-slate-700 italic">"{request.reason}"</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú phản hồi / Lý do từ chối (nếu có)</Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú gửi cho khách thuê..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!isPendingStatus || isMutating}
              className="h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 sm:justify-end">
          {isPendingStatus ? (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isMutating}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Từ chối
              </Button>
              <Button onClick={handleApprove} disabled={isMutating} className="bg-emerald-600 hover:bg-emerald-700">
                {approveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Duyệt đồng ý
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
