import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TicketCommentSection } from '../components/ticket-comment-section';
import { TicketAssignmentModal } from '../components/ticket-assignment-modal';
import { ticketApi } from '../api/ticket.api';
import type { TicketDetail, TicketComment, TicketPriority, TicketStatus } from '../api/types';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const ticketRes = await ticketApi.getTicketById(Number(id));
        setTicket(ticketRes);
        
        try {
          const commentsRes = await ticketApi.getTicketComments(Number(id));
          setComments(commentsRes);
        } catch (error) {
          // It's fine if comments fail or don't exist yet
          console.error('Failed to load comments', error);
          setComments([]);
        }
      } catch (error) {
        console.error('Failed to load ticket', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddComment = async (content: string, isInternal: boolean) => {
    if (!ticket) return;
    try {
      const newComment = await ticketApi.createComment(ticket.id, content, isInternal);
      setComments((current) => [...current, newComment]);
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleUpdateTicket = async (data: { status?: TicketStatus; assigneeId?: number | null; note?: string }) => {
    if (!ticket) return;
    try {
      if (data.status) {
        await ticketApi.updateTicketStatus(ticket.id, data.status);
      }
      if (data.assigneeId !== undefined) {
        await ticketApi.assignTicket(ticket.id, data.assigneeId);
      }
      // Reload ticket
      const ticketRes = await ticketApi.getTicketById(ticket.id);
      setTicket(ticketRes);
      
      // Reload comments
      const commentsRes = await ticketApi.getTicketComments(ticket.id);
      setComments(commentsRes);
    } catch (error) {
      console.error('Failed to update ticket', error);
    }
  };

  const getPriorityBadge = (priority?: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800 border-none px-3 py-1 flex gap-1"><span className="material-symbols-outlined text-[14px]">priority_high</span>Khẩn cấp</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800 border-none px-3 py-1 flex gap-1"><span className="material-symbols-outlined text-[14px]">priority_high</span>Cao</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-blue-100 text-blue-800 border-none px-3 py-1 flex gap-1">Trung bình</Badge>;
      case 'LOW':
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-none px-3 py-1 flex gap-1">Thấp</Badge>;
    }
  };

  const getStatusBadge = (status?: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-blue-100 text-blue-800 border-none px-3 py-1 flex gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Mới tạo</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1 flex gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Đang xử lý</Badge>;
      case 'WAITING_RENTER':
        return <Badge className="bg-purple-100 text-purple-800 border-none px-3 py-1 flex gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Chờ phản hồi</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1 flex gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Đã giải quyết</Badge>;
      case 'CLOSED':
      case 'CANCELED':
        return <Badge className="bg-slate-100 text-slate-800 border-none px-3 py-1 flex gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span>{status === 'CLOSED' ? 'Đã đóng' : 'Đã hủy'}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-slate-500">Đang tải chi tiết ticket...</div>;
  }

  if (!ticket) {
    return <div className="p-8 text-red-500">Không tìm thấy ticket!</div>;
  }

  return (
    <div className="flex flex-col w-full p-8 gap-6 max-w-[1440px] mx-auto bg-background min-h-[calc(100vh-64px)]">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-slate-500 gap-2 font-medium">
        <Link to="/ho-tro" className="hover:text-primary transition-colors">Hỗ trợ (Tickets)</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-slate-900 font-semibold">#{ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Tạo ngày {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Mô tả chi tiết
            </h2>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">attachment</span>
              Hình ảnh đính kèm ({ticket.attachmentCount || 0})
            </h2>
            {ticket.attachmentCount > 0 ? (
              <div className="text-sm text-slate-500 italic">Tính năng xem ảnh đang phát triển.</div>
            ) : (
              <div className="text-sm text-slate-500 italic">Không có hình ảnh đính kèm.</div>
            )}
          </div>

          {/* Comments Section */}
          <TicketCommentSection comments={comments} onAddComment={handleAddComment} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-3 border border-slate-200">
            <Button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">engineering</span>
              Phân công & Trạng thái
            </Button>
          </div>

          {/* Tenant Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Thông tin người thuê</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900">{ticket.createdBy?.fullName}</span>
                <span className="text-sm text-slate-500">Khách thuê chính</span>
              </div>
            </div>
            <div className="h-[1px] w-full bg-slate-200 my-2"></div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-pointer w-fit">
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span className="text-sm">{ticket.createdBy?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-pointer w-fit">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span className="text-sm">{ticket.createdBy?.email || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vị trí sự cố</h3>
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-slate-900">{ticket.room?.name || `Phòng ${ticket.roomId}`}</span>
            </div>
            <div className="h-[1px] w-full bg-slate-200 my-2"></div>
            {ticket.contractId && (
              <Link to={`/hop-dong/${ticket.contractId}`} className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-md">description</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">Hợp đồng HĐ-{ticket.contractId}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">arrow_forward</span>
              </Link>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Chi tiết nghiệp vụ</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Phân loại</span>
                <span className="text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{ticket.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Người phụ trách</span>
                <div className="flex items-center gap-2">
                  {ticket.assignedToUser ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                        {ticket.assignedToUser.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-900 font-medium">{ticket.assignedToUser.fullName}</span>
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
  );
}
