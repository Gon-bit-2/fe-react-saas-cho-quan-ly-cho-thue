import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { tenantMembersApi } from '@/features/tenant-members/api/tenant-members.api'

interface TicketAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: TicketStatus
  currentAssigneeId?: number | null
  currentScheduledAt?: string | null
  currentScheduledNote?: string | null
  onUpdate: (data: { status?: TicketStatus; assigneeId?: number | null; scheduledAt?: string | null; scheduledNote?: string | null; note?: string }) => void
}

export function TicketAssignmentModal({
  isOpen,
  onClose,
  currentStatus,
  currentAssigneeId,
  currentScheduledAt,
  currentScheduledNote,
  onUpdate,
}: TicketAssignmentModalProps) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus)
  const [assigneeId, setAssigneeId] = useState<string>(currentAssigneeId ? String(currentAssigneeId) : 'unassigned')
  const [note, setNote] = useState('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [scheduledNote, setScheduledNote] = useState<string>('')

  // Đồng bộ lại state mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setStatus(currentStatus)
        setAssigneeId(currentAssigneeId ? String(currentAssigneeId) : 'unassigned')
        setNote('')
        // Tự động điền lại ngày giờ nếu đã có (định dạng YYYY-MM-DDThh:mm để dùng cho input type datetime-local)
        setScheduledAt(currentScheduledAt ? new Date(currentScheduledAt).toISOString().slice(0, 16) : '')
        setScheduledNote(currentScheduledNote || '')
      }, 0)
    }
  }, [isOpen, currentStatus, currentAssigneeId, currentScheduledAt, currentScheduledNote])

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['tenant-members'],
    queryFn: tenantMembersApi.getTenantMembers,
    enabled: isOpen,
  })

  // Chỉ cho phép assign cho các vai trò quản lý / bảo trì
  const assignableMembers = useMemo(() => {
    if (!members) return []
    const ASSIGNABLE_ROLES = ['LANDLORD', 'MANAGER', 'MAINTENANCE_STAFF']
    return members.filter(m => m.status === 'ACTIVE' && ASSIGNABLE_ROLES.includes(m.roleId))
  }, [members])

  const handleSubmit = () => {
    onUpdate({
      status: status !== currentStatus ? status : undefined,
      assigneeId: assigneeId !== 'unassigned' ? Number(assigneeId) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      scheduledNote: scheduledNote.trim() || null,
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
              <SelectTrigger id="assignee" disabled={isLoadingMembers}>
                <SelectValue placeholder={isLoadingMembers ? "Đang tải danh sách..." : "Chọn người phụ trách"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Chưa phân công</SelectItem>
                {assignableMembers.map(member => (
                  <SelectItem key={member.id} value={String(member.userId)}>
                    {member.user?.fullName} ({member.role?.name || member.roleId})
                  </SelectItem>
                ))}
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
            <Label htmlFor="scheduledAt">
              {status === 'RESOLVED' || status === 'CLOSED' ? 'Thời gian hoàn thành' : 'Thời gian tiến hành (dự kiến)'}
            </Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scheduledNote">
              {status === 'RESOLVED' || status === 'CLOSED' ? 'Ghi chú hoàn thành' : 'Ghi chú lịch hẹn bảo trì'}
            </Label>
            <Input
              id="scheduledNote"
              value={scheduledNote}
              onChange={(e) => setScheduledNote(e.target.value)}
              placeholder={status === 'RESOLVED' || status === 'CLOSED' ? "Ví dụ: Đã thay linh kiện mới..." : "Ví dụ: Nhớ mang theo thang, gọi trước khi đến..."}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Ghi chú cập nhật (Nội bộ)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nội bộ cho thay đổi này..."
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
