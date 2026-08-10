import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPayments } from '../api';
import { PaymentStatus, PaymentMethod, PaymentDto, PaymentListDto } from '../types';

export function PaymentListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentListDto>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);

  // Mock stats
  const stats = {
    pendingReview: 42,
    processedToday: 128,
    totalReconciled: 485250000
  };

  useEffect(() => {
    const loadPayments = async () => {
      setIsLoading(true);
      try {
        const response = await getPayments(filters);
        setPayments(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load payments', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPayments();
  }, [filters]);

  const getMethodDisplay = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER:
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-[10px] font-bold text-blue-800">QR</div>
            <span className="text-slate-500">VietQR</span>
          </div>
        );
      case PaymentMethod.CASH:
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-[10px] font-bold text-emerald-800">TM</div>
            <span className="text-slate-500">Tiền mặt</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-700">Khác</div>
            <span className="text-slate-500">Khác</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Chờ duyệt
          </span>
        );
      case PaymentStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Đã duyệt
          </span>
        );
      case PaymentStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 min-h-[calc(100vh-64px)] gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Đối Soát Thanh Toán</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm tra và đối soát các khoản thanh toán với hóa đơn công nợ.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất Báo Cáo
          </Button>
          <Button className="flex items-center gap-2 shadow-md bg-blue-600 hover:bg-blue-700">
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Đồng Bộ Giao Dịch
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ Duyệt</span>
            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{stats.pendingReview}</span>
            <span className="text-xs text-slate-500">Cần kiểm tra thủ công</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Xử Lý Hôm Nay</span>
            <span className="material-symbols-outlined text-blue-600">fact_check</span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{stats.processedToday}</span>
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +14% so với hôm qua
            </span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Tổng Đã Đối Soát</span>
            <span className="material-symbols-outlined text-white/90">account_balance_wallet</span>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-3xl font-bold text-white tabular-nums">{stats.totalReconciled.toLocaleString()} ₫</span>
            <span className="text-xs text-white/80">Kỳ thanh toán hiện tại</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between z-20">
        <div className="flex-1 w-full flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder:text-slate-400" 
            placeholder="Tìm theo mã GD, tên người thuê, mã hóa đơn..." 
            type="text"
            onChange={(e) => setFilters((prev: PaymentListDto) => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Filter Dropdown */}
          <Select onValueChange={(val) => setFilters((prev: PaymentListDto) => ({ ...prev, status: val }))}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Trạng thái: Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={PaymentStatus.PENDING}>Chờ duyệt</SelectItem>
              <SelectItem value={PaymentStatus.APPROVED}>Đã duyệt</SelectItem>
              <SelectItem value={PaymentStatus.REJECTED}>Từ chối</SelectItem>
            </SelectContent>
          </Select>

          {/* Provider Filter */}
          <Select onValueChange={(val) => setFilters((prev: PaymentListDto) => ({ ...prev, method: val }))}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Phương thức: Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phương thức</SelectItem>
              <SelectItem value={PaymentMethod.BANK_TRANSFER}>Chuyển khoản / VietQR</SelectItem>
              <SelectItem value={PaymentMethod.CASH}>Tiền mặt</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Button variant="outline" className="flex items-center gap-2 bg-slate-50 border-slate-200 text-slate-600">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Tháng này
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Mã Giao Dịch</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Mã Hóa Đơn</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Người Thuê / Phòng</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Số Tiền (VNĐ)</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Phương Thức</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Thời Gian</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Trạng Thái</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">Không có giao dịch nào</TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow 
                    key={payment.id} 
                    className={`group hover:bg-slate-50/80 transition-colors ${payment.status === PaymentStatus.REJECTED ? 'bg-red-50/30' : ''}`}
                  >
                    <TableCell className="font-medium text-slate-900 tabular-nums">
                      <div className="flex items-center gap-2">
                        {payment.transactionCode || `TXN-${payment.id.toString().padStart(6, '0')}`}
                        <span className="material-symbols-outlined text-[16px] text-slate-400 cursor-pointer hover:text-primary transition-colors" title="Copy">content_copy</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.invoice ? (
                        <Link to={`/app/hoa-don/${payment.invoice.id}`} className="text-primary hover:underline font-medium tabular-nums">
                          {payment.invoice.invoiceCode}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Không xác định</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{payment.renter?.fullName || 'Khách vãng lai'}</span>
                        <span className="text-xs text-slate-500">{payment.room?.title || 'Không rõ phòng'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 tabular-nums">
                      {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getMethodDisplay(payment.method)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col tabular-nums">
                        <span className="text-sm text-slate-900">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === PaymentStatus.PENDING ? (
                        <Button 
                          onClick={() => navigate(`/app/thanh-toan/${payment.id}/duyet`)}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all h-8 px-3 text-xs"
                        >
                          Duyệt
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          onClick={() => navigate(`/app/thanh-toan/${payment.id}`)}
                          className="text-slate-500 hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all h-8 px-3 text-xs"
                        >
                          Xem chi tiết
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between mt-auto">
          <span className="text-sm text-slate-500">
            Hiển thị {payments.length > 0 ? (filters.page! - 1) * filters.limit! + 1 : 0} đến {Math.min(filters.page! * filters.limit!, total)} trong số {total} mục
          </span>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8 text-slate-500"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev: PaymentListDto) => ({ ...prev, page: prev.page! - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button size="sm" className="w-8 h-8 p-0">{filters.page}</Button>
            {total > filters.page! * filters.limit! && (
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8 text-slate-500"
                onClick={() => setFilters((prev: PaymentListDto) => ({ ...prev, page: prev.page! + 1 }))}
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
