import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ticketApi, GetTicketsParams } from '../api/ticket.api';
import { TicketSummary, TicketStatus, TicketPriority } from '../api/types';

export function TicketListPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    status?: TicketStatus | 'all';
    priority?: TicketPriority | 'all';
  }>({
    page: 1,
    limit: 10
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const queryParams = { ...filters };
        if (queryParams.status === 'all') delete queryParams.status;
        if (queryParams.priority === 'all') delete queryParams.priority;
        
        const response = await ticketApi.getTickets(queryParams as GetTicketsParams);
        setTickets(response.data);
        setTotal(response.meta.total);
      } catch (error) {
        console.error('Failed to load tickets', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTickets();
  }, [filters]);

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Khẩn cấp</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Cao</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Trung bình</Badge>;
      case 'LOW':
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Thấp</Badge>;
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">Mới tạo</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Đang xử lý</Badge>;
      case 'WAITING_RENTER':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Chờ phản hồi</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đã giải quyết</Badge>;
      case 'CLOSED':
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Đã đóng</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Đã hủy</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Danh Sách Hỗ Trợ (Tickets)</h1>
          <p className="text-sm text-slate-500">Quản lý và xử lý các yêu cầu hỗ trợ từ người thuê.</p>
        </div>
        <Link to="/app/ho-tro/tao-moi">
          <Button className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo Ticket
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài sản</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả tài sản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tài sản</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
          <Select onValueChange={(val) => setFilters(prev => ({ ...prev, status: val as TicketStatus | 'all' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="OPEN">Mới tạo</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="WAITING_RENTER">Chờ phản hồi</SelectItem>
              <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
              <SelectItem value="CLOSED">Đã đóng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mức độ</label>
          <Select onValueChange={(val) => setFilters(prev => ({ ...prev, priority: val as TicketPriority | 'all' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="LOW">Thấp</SelectItem>
              <SelectItem value="MEDIUM">Trung bình</SelectItem>
              <SelectItem value="HIGH">Cao</SelectItem>
              <SelectItem value="URGENT">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[250px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
          <Input 
            className="pl-10" 
            placeholder="Tìm kiếm mã ticket, tiêu đề..." 
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-500 uppercase w-24">Mã</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase w-[30%]">Vấn đề</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Phòng / Khu</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Người thuê</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Mức độ</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Trạng thái</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Người xử lý</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right">Cập nhật</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">Không tìm thấy ticket nào</TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="group hover:bg-slate-50 cursor-pointer">
                    <TableCell className="font-medium text-slate-500">
                      <Link to={`/app/ho-tro/${ticket.id}`}>#TK-{ticket.id}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900 mb-1">{ticket.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{ticket.room?.name || `Phòng ${ticket.roomId}`}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                          {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <span>{ticket.createdBy?.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(ticket.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      {ticket.assignedToUser ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                            {ticket.assignedToUser.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{ticket.assignedToUser.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phân công</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {new Date(ticket.updatedAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/app/ho-tro/${ticket.id}`}>
                            <DropdownMenuItem>
                              <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
                              Xem chi tiết
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
                            Phân công
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 mt-auto">
          <div className="text-sm text-slate-500">
            Hiển thị {tickets.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} đến {Math.min(filters.page * filters.limit, total)} trong số {total} mục
          </div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8"
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button variant="default" size="sm" className="w-8 h-8 p-0">{filters.page}</Button>
            {total > filters.page * filters.limit && (
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
