import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { TicketStatus } from '../api/types'

interface TicketAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: TicketStatus
  currentAssigneeId?: number | null
  onUpdate: (data: { status?: TicketStatus; assigneeId?: number | null; note?: string }) => void
}

export function TicketAssignmentModal({
  isOpen,
  onClose,
  currentStatus,
  currentAssigneeId,
  onUpdate,
}: TicketAssignmentModalProps) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [assigneeId, setAssigneeId] = useState<string>(currentAssigneeId ? String(currentAssigneeId) : 'unassigned')
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    onUpdate({
      status: status !== currentStatus ? status : undefined,
      assigneeId: assigneeId !== 'unassigned' ? Number(assigneeId) : null,
      note: note.trim() || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật Ticket</DialogTitle>
          <DialogDescription>
            Phân công người xử lý và cập nhật trạng thái mới cho yêu cầu hỗ trợ này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="assignee">Người phụ trách</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Chọn người phụ trách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Chưa phân công</SelectItem>
                <SelectItem value="1">Nguyễn Văn A (Quản lý)</SelectItem>
                <SelectItem value="2">Trần Văn Kỹ Thuật (Bảo trì)</SelectItem>
                <SelectItem value="3">Lê Thị C (Kế toán)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as TicketStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Mới tạo</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                <SelectItem value="WAITING_RENTER">Chờ phản hồi</SelectItem>
                <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                <SelectItem value="CLOSED">Đã đóng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Ghi chú cập nhật</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho thay đổi này..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
