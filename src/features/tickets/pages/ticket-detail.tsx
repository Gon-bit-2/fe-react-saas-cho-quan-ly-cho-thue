import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from '@/shared/constants/status-config'
import { TicketCommentSection } from '../components/ticket-comment-section'
import { TicketAssignmentModal } from '../components/ticket-assignment-modal'
import { ticketApi } from '../api/ticket.api'
import type { TicketDetail, TicketComment, TicketPriority, TicketStatus, TicketAttachment } from '../api/types'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronRight,
  Calendar,
  FileText,
  Paperclip,
  Upload,
  UserCircle2,
  Phone,
  Clock,
  Mail,
  MapPin,
  Settings,
  MoreVertical,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
      const ticketRes = await ticketApi.getTicketById(ticket.id)
      setTicket(ticketRes)

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
      const attachmentsRes = await ticketApi.getTicketAttachments(ticket.id)
      setAttachments(attachmentsRes.data || [])
      const ticketRes = await ticketApi.getTicketById(ticket.id)
      setTicket(ticketRes)
    } catch (error: unknown) {
      console.error('Failed to upload attachment', error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải lên')
    } finally {
      setIsUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const getPriorityBadge = (priority?: TicketPriority) => {
    if (!priority) return null
    return (
      <StatusBadge
        status={priority}
        statusMap={TICKET_PRIORITY_MAP}
        fallbackLabel={priority}
        className="px-3 py-1 text-xs font-bold tracking-wider uppercase"
      />
    )
  }

  const getStatusBadge = (status?: TicketStatus) => {
    if (!status) return null
    return (
      <StatusBadge
        status={status}
        statusMap={TICKET_STATUS_MAP}
        fallbackLabel={status}
        className="px-3 py-1 text-xs font-bold tracking-wider uppercase"
      />
    )
  }

  if (isLoading) {
    return <div className="p-8 py-12 text-center text-slate-500">Đang tải chi tiết ticket...</div>
  }

  if (!ticket) {
    return <div className="p-8 py-12 text-center text-red-500">Không tìm thấy ticket!</div>
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 pb-12 duration-500">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/ho-tro" className="transition-colors hover:text-blue-600">
          Hỗ trợ (Tickets)
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-slate-900">#{ticket.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              Tạo ngày: {new Date(ticket.createdAt).toLocaleDateString('vi-VN')} lúc{' '}
              {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-2 text-slate-400">|</span>
            <span className="flex items-center gap-2">
              <span className="font-medium text-slate-500">#{ticket.id}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button variant="outline" className="bg-white text-slate-700">
            <MoreVertical className="h-4 w-4" />
          </Button>
          <Button className="bg-blue-600 shadow-sm hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Cập nhật trạng thái
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Main content) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <FileText className="h-5 w-5 text-blue-500" />
                Mô tả chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-50/50 p-6 leading-relaxed whitespace-pre-line text-slate-700">
              {ticket.description}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Paperclip className="h-5 w-5 text-blue-500" />
                Hình ảnh đính kèm ({ticket.attachmentCount || attachments.length || 0})
              </CardTitle>
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
                  className="h-8"
                  disabled={isUploading}
                  onClick={() => document.getElementById('ticket-attachment-upload')?.click()}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {isUploading ? 'Đang tải...' : 'Thêm ảnh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {attachments.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={attachment.fileUrl}
                        alt="Attachment"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowUpRight className="h-6 w-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400">
                  <Paperclip className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Không có tài liệu/hình ảnh đính kèm</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments / Timeline */}
          <TicketCommentSection comments={comments} onAddComment={handleAddComment} />
        </div>

        {/* Right Column (Meta) */}
        <div className="space-y-6">
          {/* Assignment & Business details */}
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <div className="h-1.5 w-full bg-blue-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                Chi tiết nghiệp vụ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-2">
              <div>
                <div className="mb-1 text-xs text-slate-500">Phân loại</div>
                <div className="font-semibold text-slate-900">{ticket.category}</div>
              </div>

              <div className="h-px w-full bg-slate-100"></div>

              <div>
                <div className="mb-2 text-xs text-slate-500">Người phụ trách</div>
                                  {ticket.assignedToUser ? (
                    <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarFallback className="bg-blue-100 text-xs font-bold text-blue-700">
                            {ticket.assignedToUser.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-900">{ticket.assignedToUser.fullName}</span>
                      </div>
                      
                      {ticket.scheduledAt && (
                        <div className="flex flex-col gap-1 mt-2 text-sm text-slate-600 border-t border-slate-200 pt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Dự kiến: <strong>{new Date(ticket.scheduledAt).toLocaleString('vi-VN')}</strong></span>
                          </div>
                          {ticket.scheduledNote && (
                            <div className="text-slate-500 italic">
                              "{ticket.scheduledNote}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                    <AlertTriangle className="h-4 w-4" /> Chưa phân công
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Renter Info */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-500 uppercase">
                <UserCircle2 className="h-4 w-4" /> Người báo cáo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-slate-200">
                  <AvatarFallback className="bg-emerald-100 font-bold text-emerald-700">
                    {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'KH'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-slate-900">{ticket.createdBy?.fullName || 'Khách thuê'}</div>
                  <Badge variant="outline" className="mt-1 border-slate-200 bg-slate-50 font-normal text-slate-600">
                    Khách thuê chính
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {ticket.createdBy?.phone || 'Chưa cập nhật'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {ticket.createdBy?.email || 'Chưa cập nhật'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location / Property */}
          <Card className="relative overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MapPin className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-500 uppercase">
                <MapPin className="h-4 w-4" /> Vị trí sự cố
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 p-6">
              <div>
                <div className="text-xl font-bold text-slate-900">{ticket.room?.name || `Phòng ${ticket.roomId}`}</div>
                <div className="mt-1 text-sm text-slate-500">Khu nhà trọ trung tâm</div>
              </div>

              {ticket.contractId && (
                <Link
                  to={`/hop-dong/${ticket.contractId}`}
                  className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Hợp đồng liên quan</div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                        HĐ-{ticket.contractId}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                </Link>
              )}
            </CardContent>
          </Card>
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


