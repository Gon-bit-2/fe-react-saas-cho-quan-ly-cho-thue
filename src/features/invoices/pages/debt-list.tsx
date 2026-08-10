import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getInvoices } from '../api';
import { InvoiceStatus, InvoiceListDto, InvoiceDto } from '../types';

export function DebtListPage() {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceListDto>({
    page: 1,
    limit: 10,
    status: InvoiceStatus.OVERDUE // default to show debts
  });
  const [total, setTotal] = useState(0);

  // Mock stats
  const stats = {
    totalOutstanding: 124500000,
    overdueMoreThan30: 45200000,
    overdueLessThan30: 68300000,
    currentNotDue: 11000000
  };

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await getInvoices(filters);
        // Filter out only debts in reality, here just use mock data
        setInvoices(response.data.filter((i: InvoiceDto) => i.debtAmount > 0));
        setTotal(response.total);
      } catch (error) {
        console.error('Failed to load debts', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoices();
  }, [filters]);

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 min-h-[calc(100vh-64px)] gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Danh Sách Công Nợ</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi và quản lý công nợ của người thuê.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất CSV
          </Button>
          <Button className="flex items-center gap-2 shadow-md">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            Nhắc Nhở Hàng Loạt
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Công Nợ</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums relative z-10">{stats.totalOutstanding.toLocaleString()} ₫</div>
          <div className="flex items-center gap-1 mt-2 text-red-600 relative z-10">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span className="text-xs font-medium">+5.2% so với tháng trước</span>
          </div>
        </div>

        {/* Overdue > 30 Days */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quá hạn &gt; 30 ngày</span>
          </div>
          <div className="text-2xl font-bold text-red-600 tabular-nums relative z-10">{stats.overdueMoreThan30.toLocaleString()} ₫</div>
          <div className="flex items-center gap-1 mt-2 text-slate-500 relative z-10">
            <span className="text-xs font-medium">Từ 12 người thuê</span>
          </div>
        </div>

        {/* Overdue 1-30 Days */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quá hạn 1-30 ngày</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums relative z-10">{stats.overdueLessThan30.toLocaleString()} ₫</div>
          <div className="flex items-center gap-1 mt-2 text-slate-500 relative z-10">
            <span className="text-xs font-medium">Từ 24 người thuê</span>
          </div>
        </div>

        {/* Not Yet Due */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trong hạn (Chưa đến hạn)</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums relative z-10">{stats.currentNotDue.toLocaleString()} ₫</div>
          <div className="flex items-center gap-1 mt-2 text-slate-500 relative z-10">
            <span className="text-xs font-medium">Từ 5 người thuê</span>
          </div>
        </div>
      </div>

      {/* Main Data Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">search</span>
              <Input 
                className="pl-10 bg-white" 
                placeholder="Tìm kiếm người thuê, hóa đơn..." 
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="hidden md:block h-6 w-[1px] bg-slate-200"></div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-slate-500">Lọc theo:</span>
              <Select onValueChange={(val) => setFilters(prev => ({ ...prev, status: val as InvoiceStatus }))}>
                <SelectTrigger className="bg-white w-[130px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value={InvoiceStatus.OVERDUE}>Quá hạn</SelectItem>
                  <SelectItem value={InvoiceStatus.UNPAID}>Chưa thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-slate-500 w-full md:w-auto text-left md:text-right">
            Hiển thị 1-10 của 41
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Người Thuê</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Mã Hóa Đơn</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Tổng Tiền</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Đã Trả</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Công Nợ Còn Lại</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Hạn Thanh Toán</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase whitespace-nowrap">Trạng Thái</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">Không có công nợ nào</TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice, index) => {
                  const isOverdue = invoice.status === InvoiceStatus.OVERDUE;
                  const isWarning = invoice.status === InvoiceStatus.UNPAID && index % 2 === 1; // mock logic
                  
                  return (
                    <TableRow 
                      key={invoice.id} 
                      className={`group hover:bg-slate-50/80 transition-colors ${isOverdue ? 'bg-red-50/30' : isWarning ? 'bg-amber-50/30' : ''}`}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                            isOverdue ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
                          }`}>
                            {invoice.renter?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{invoice.renter?.fullName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{invoice.room?.title}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/app/hoa-don/${invoice.id}`} className="text-primary font-medium hover:underline">
                          {invoice.invoiceCode}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-600">
                        {invoice.totalAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-emerald-600">
                        {invoice.paidAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell className={`text-right tabular-nums font-bold text-base ${isOverdue ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
                        {invoice.debtAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell className="tabular-nums text-slate-600">
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : '-'}
                      </TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                            Quá hạn
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            Sắp đến hạn
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                            Trong hạn
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Nhắc nhở Zalo">
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100" title="Nhắc nhở Email">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white mt-auto">
          <div className="text-sm text-slate-500">
            Hiển thị {invoices.length > 0 ? (filters.page! - 1) * filters.limit! + 1 : 0} đến {Math.min(filters.page! * filters.limit!, total)} trong số {total} mục
          </div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8"
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button variant="default" size="sm" className="w-8 h-8 p-0">{filters.page}</Button>
            {/* Simple pagination logic for demo */}
            {total > filters.page! * filters.limit! && (
              <Button 
                variant="outline" 
                size="icon" 
                className="w-8 h-8"
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
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
