import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TicketCommentSection } from '../components/ticket-comment-section'
import { TicketAssignmentModal } from '../components/ticket-assignment-modal'
import { ticketApi } from '../api/ticket.api'
import type { TicketDetail, TicketComment, TicketPriority, TicketStatus, TicketAttachment } from '../api/types'
import { toast } from 'sonner'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const ticketRes = await ticketApi.getTicketById(Number(id))
        setTicket(ticketRes)

        try {
          const commentsRes = await ticketApi.getTicketComments(Number(id))
          setComments(commentsRes)
        } catch (error) {
          // It's fine if comments fail or don't exist yet
          console.error('Failed to load comments', error)
          setComments([])
        }

        try {
          const attachmentsRes = await ticketApi.getTicketAttachments(Number(id))
          setAttachments(attachmentsRes.data || [])
        } catch (error) {
          console.error('Failed to load attachments', error)
          setAttachments([])
        }
      } catch (error) {
        console.error('Failed to load ticket', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleAddComment = async (content: string, isInternal: boolean) => {
    if (!ticket) return
    try {
      const newComment = await ticketApi.createComment(ticket.id, content, isInternal)
      setComments((current) => [...current, newComment])
    } catch (error) {
      console.error('Failed to add comment', error)
    }
  }

  const handleUpdateTicket = async (data: { status?: TicketStatus; assigneeId?: number | null; note?: string }) => {
    if (!ticket) return
    try {
      if (data.status) {
        await ticketApi.updateTicketStatus(ticket.id, data.status)
      }
      if (data.assigneeId !== undefined) {
        await ticketApi.assignTicket(ticket.id, data.assigneeId)
      }
      // Reload ticket
      const ticketRes = await ticketApi.getTicketById(ticket.id)
      setTicket(ticketRes)

      // Reload comments
      const commentsRes = await ticketApi.getTicketComments(ticket.id)
      setComments(commentsRes)
    } catch (error) {
      console.error('Failed to update ticket', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ticket) return
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await ticketApi.uploadAttachment(ticket.id, file)
      toast.success('Đã tải lên ảnh đính kèm')
      // Reload attachments
      const attachmentsRes = await ticketApi.getTicketAttachments(ticket.id)
      setAttachments(attachmentsRes.data || [])
      // Reload ticket to update count
      const ticketRes = await ticketApi.getTicketById(ticket.id)
      setTicket(ticketRes)
    } catch (error: unknown) {
      console.error('Failed to upload attachment', error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải lên')
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = '' // Reset input
      }
    }
  }

  const getPriorityBadge = (priority?: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <Badge className="flex gap-1 border-none bg-red-100 px-3 py-1 text-red-800">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>Khẩn cấp
          </Badge>
        )
      case 'HIGH':
        return (
          <Badge className="flex gap-1 border-none bg-orange-100 px-3 py-1 text-orange-800">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>Cao
          </Badge>
        )
      case 'MEDIUM':
        return <Badge className="flex gap-1 border-none bg-blue-100 px-3 py-1 text-blue-800">Trung bình</Badge>
      case 'LOW':
      default:
        return <Badge className="flex gap-1 border-none bg-slate-100 px-3 py-1 text-slate-800">Thấp</Badge>
    }
  }

  const getStatusBadge = (status?: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge className="flex gap-1 border-none bg-blue-100 px-3 py-1 text-blue-800">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>Mới tạo
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge className="flex gap-1 border-none bg-amber-100 px-3 py-1 text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>Đang xử lý
          </Badge>
        )
      case 'WAITING_RENTER':
        return (
          <Badge className="flex gap-1 border-none bg-purple-100 px-3 py-1 text-purple-800">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>Chờ phản hồi
          </Badge>
        )
      case 'RESOLVED':
        return (
          <Badge className="flex gap-1 border-none bg-emerald-100 px-3 py-1 text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>Đã giải quyết
          </Badge>
        )
      case 'CLOSED':
      case 'CANCELED':
        return (
          <Badge className="flex gap-1 border-none bg-slate-100 px-3 py-1 text-slate-800">
            <span className="h-2 w-2 rounded-full bg-slate-500"></span>
            {status === 'CLOSED' ? 'Đã đóng' : 'Đã hủy'}
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="p-8 text-slate-500">Đang tải chi tiết ticket...</div>
  }

  if (!ticket) {
    return <div className="p-8 text-red-500">Không tìm thấy ticket!</div>
  }

  return (
    <div className="bg-background mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1440px] flex-col gap-6 p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/ho-tro" className="hover:text-primary transition-colors">
          Hỗ trợ (Tickets)
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-slate-900">#{ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Header Card */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Tạo ngày {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <span className="material-symbols-outlined text-primary">description</span>
              Mô tả chi tiết
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600">{ticket.description}</p>
          </div>

          {/* Attachments Section */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span className="material-symbols-outlined text-primary">attachment</span>
                Hình ảnh đính kèm ({ticket.attachmentCount || 0})
              </h2>
              <div>
                <input
                  type="file"
                  id="ticket-attachment-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isUploading}
                  onClick={() => document.getElementById('ticket-attachment-upload')?.click()}
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {isUploading ? 'Đang tải lên...' : 'Thêm ảnh'}
                </Button>
              </div>
            </div>

            {attachments.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img
                      src={attachment.fileUrl}
                      alt="Attachment"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                      <span className="material-symbols-outlined text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100">
                        open_in_new
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-sm text-slate-500 italic">
                Không có hình ảnh đính kèm.
              </div>
            )}
          </div>

          {/* Comments Section */}
          <TicketCommentSection comments={comments} onAddComment={handleAddComment} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Actions Card */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Button onClick={() => setIsModalOpen(true)} className="flex w-full items-center justify-center gap-2">
              <span className="material-symbols-outlined">engineering</span>
              Phân công & Trạng thái
            </Button>
          </div>

          {/* Tenant Info */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Thông tin người thuê</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900">{ticket.createdBy?.fullName}</span>
                <span className="text-sm text-slate-500">Khách thuê chính</span>
              </div>
            </div>
            <div className="my-2 h-[1px] w-full bg-slate-200"></div>
            <div className="flex flex-col gap-3">
              <div className="hover:text-primary flex w-fit cursor-pointer items-center gap-3 text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span className="text-sm">{ticket.createdBy?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="hover:text-primary flex w-fit cursor-pointer items-center gap-3 text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span className="text-sm">{ticket.createdBy?.email || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-bl-full"></div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Vị trí sự cố</h3>
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-slate-900">
                {ticket.room?.name || `Phòng ${ticket.roomId}`}
              </span>
            </div>
            <div className="my-2 h-[1px] w-full bg-slate-200"></div>
            {ticket.contractId && (
              <Link
                to={`/hop-dong/${ticket.contractId}`}
                className="group -mx-2 flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/10 rounded-md p-2">
                    description
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">Hợp đồng HĐ-{ticket.contractId}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined group-hover:text-primary text-slate-400 transition-colors">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Chi tiết nghiệp vụ</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Phân loại</span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-900">{ticket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Người phụ trách</span>
                <div className="flex items-center gap-2">
                  {ticket.assignedToUser ? (
                    <>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                        {ticket.assignedToUser.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{ticket.assignedToUser.fullName}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Chưa phân công</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TicketAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStatus={ticket.status}
        currentAssigneeId={ticket.assignedTo}
        onUpdate={handleUpdateTicket}
      />
    </div>
  )
}
