import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getInvoices } from '../api';
import { InvoiceStatus, type Invoice, type InvoiceListParams } from '../types';

export function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceListParams>({
    page: 1,
    limit: 10
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await getInvoices(filters);
        setInvoices(response.data);
        setTotal(response.meta.total);
      } catch (error) {
        console.error('Failed to load invoices', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInvoices();
  }, [filters]);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đã thanh toán</Badge>;
      case InvoiceStatus.OVERDUE:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Quá hạn</Badge>;
      case InvoiceStatus.DRAFT:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-200">Bản nháp</Badge>;
      case InvoiceStatus.UNPAID:
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Chờ thanh toán</Badge>;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Danh Sách Hóa Đơn</h1>
          <p className="text-sm text-slate-500">Quản lý và theo dõi thanh toán cho tất cả các tài sản.</p>
        </div>
        <Link to="/app/hoa-don/tao-moi">
          <Button className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tạo Hóa Đơn
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
              <SelectItem value="1">Sunrise Towers</SelectItem>
              <SelectItem value="2">Oakwood Apartments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tháng</label>
          <Input 
            type="month" 
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                billingMonth: e.target.value ? `${e.target.value}-01` : undefined,
                page: 1,
              }))
            }
          />
        </div>
        
        <div className="flex-1 min-w-[150px] flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
          <Select
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                status: val === 'all' ? undefined : (val as InvoiceStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={InvoiceStatus.DRAFT}>Bản nháp</SelectItem>
              <SelectItem value={InvoiceStatus.UNPAID}>Chờ thanh toán</SelectItem>
              <SelectItem value={InvoiceStatus.PAID}>Đã thanh toán</SelectItem>
              <SelectItem value={InvoiceStatus.OVERDUE}>Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[250px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
          <Input 
            className="pl-10" 
            placeholder="Tìm kiếm mã hóa đơn, người thuê..." 
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-500 uppercase">Mã Hóa Đơn</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Kỳ</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Người Thuê / Phòng</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right">Tổng Tiền</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right">Đã Trả</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right">Còn Nợ</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Hạn Thanh Toán</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-center">Trạng Thái</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-500">Không tìm thấy hóa đơn nào</TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="group hover:bg-slate-50 cursor-pointer">
                    <TableCell className="font-medium text-primary">
                      <Link to={`/app/hoa-don/${invoice.id}`}>{invoice.invoiceCode}</Link>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(invoice.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{invoice.renter?.fullName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{invoice.room?.title}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {invoice.totalAmount.toLocaleString()} ₫
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {invoice.paidAmount.toLocaleString()} ₫
                    </TableCell>
                    <TableCell className={`text-right font-medium ${invoice.debtAmount > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {invoice.debtAmount.toLocaleString()} ₫
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/app/hoa-don/${invoice.id}`}>
                            <DropdownMenuItem>
                              <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
                              Xem chi tiết
                            </DropdownMenuItem>
                          </Link>
                          {invoice.status === InvoiceStatus.DRAFT && (
                            <Link to={`/app/hoa-don/${invoice.id}/chinh-sua`}>
                              <DropdownMenuItem>
                                <span className="material-symbols-outlined mr-2 text-[18px]">edit</span>
                                Chỉnh sửa nháp
                              </DropdownMenuItem>
                            </Link>
                          )}
                          <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
                            Tải PDF
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
