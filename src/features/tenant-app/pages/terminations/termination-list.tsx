import { useState } from 'react'
import { useTerminations, useApproveTermination, useRejectTermination } from '@/shared/api/terminations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { TERMINATION_STATUS_MAP } from '@/shared/constants/status-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Loader2, CheckCircle, XCircle, Search, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'
import type { ContractTerminationRequest } from '@/types/termination'
import { formatDate } from '@/shared/lib/utils'

/**
 * Trang danh sách các yêu cầu kết thúc hợp đồng thuê từ khách
 * Hỗ trợ lọc theo trạng thái, xem lý do trả phòng và phê duyệt/từ chối yêu cầu
 */
export default function TerminationList() {
  const { data, isLoading } = useTerminations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedRequest, setSelectedRequest] = useState<ContractTerminationRequest | null>(null)

  const terminations = data?.data || []

  /**
   * Lọc danh sách yêu cầu thanh lý theo từ khóa mã HĐ và trạng thái
   */
  const filteredTerminations = terminations.filter((item) => {
    const matchSearch = String(item.contractId).includes(searchTerm) || item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-20">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu kết thúc hợp đồng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý, thẩm định các yêu cầu thanh lý hợp đồng và trả phòng trước/đúng hạn từ khách thuê.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo mã hợp đồng hoặc lý do..."
            className="pl-9 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Bị từ chối</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn tất</SelectItem>
              <SelectItem value="CANCELED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách yêu cầu thanh lý / trả phòng</CardTitle>
          <CardDescription>Tổng số: {filteredTerminations.length} yêu cầu</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Hợp đồng</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày gửi yêu cầu</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày dọn đi (Dự kiến)</TableHead>
                  <TableHead className="w-[300px] font-semibold text-slate-600">Lý do trả phòng</TableHead>
                  <TableHead className="w-36 text-center font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="w-24 text-right font-semibold text-slate-600">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-medium">
                      Đang tải danh sách yêu cầu...
                    </TableCell>
                  </TableRow>
                ) : filteredTerminations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                      Không có yêu cầu kết thúc hợp đồng nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTerminations.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900">#{item.contractId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 tabular-nums">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(item.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatDate(item.expectedMoveOutDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-2 text-sm text-slate-600" title={item.reason}>
                          {item.reason}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={item.status} statusMap={TERMINATION_STATUS_MAP} fallbackLabel={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === 'PENDING' ? (
                          <Button size="sm" className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 h-8 text-xs font-medium" onClick={() => setSelectedRequest(item)}>
                            Xét duyệt
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 text-xs font-medium" onClick={() => setSelectedRequest(item)}>
                            Chi tiết
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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

/**
 * Hộp thoại xét duyệt (Đồng ý / Từ chối) yêu cầu thanh lý hợp đồng
 */
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

  /**
   * Xử lý phê duyệt yêu cầu kết thúc
   */
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

  /**
   * Xử lý từ chối yêu cầu kết thúc
   */
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
          <DialogDescription>Khách thuê gửi yêu cầu kết thúc hợp đồng và bàn giao trả phòng.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày yêu cầu</p>
              <p className="mt-1 font-medium text-slate-900 tabular-nums">{formatDate(request.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày dọn đi (Dự kiến)</p>
              <p className="mt-1 font-semibold text-blue-600 tabular-nums">
                {formatDate(request.expectedMoveOutDate)}
              </p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lý do trả phòng</p>
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
              className="h-24 resize-none border-slate-200"
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
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Từ chối
              </Button>
              <Button onClick={handleApprove} disabled={isMutating} className="bg-emerald-600 text-white hover:bg-emerald-700">
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
