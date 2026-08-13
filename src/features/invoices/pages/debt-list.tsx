import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDebts } from '../api'
import { InvoiceStatus, type Debt, type InvoiceListParams } from '../types'

export function DebtListPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    overdueMoreThan30Days: 0,
    overdueWithin30Days: 0,
    currentNotDue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<InvoiceListParams>({
    page: 1,
    limit: 10,
    status: InvoiceStatus.OVERDUE, // default to show debts
  })
  const [total, setTotal] = useState(0)


  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true)
      try {
        const response = await getDebts(filters)
        setDebts(response.data)
        if (response.stats) {
          setStats({
            totalOutstanding: response.stats.totalOutstanding || 0,
            overdueMoreThan30Days: response.stats.overdueMoreThan30Days || 0,
            overdueWithin30Days: response.stats.overdueWithin30Days || 0,
            currentNotDue: response.stats.currentNotDue || 0,
          })
        }
        setTotal(response.meta.total)
      } catch (error) {
        console.error('Failed to load debts', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInvoices()
  }, [filters])

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6 bg-slate-50 p-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Danh Sách Công Nợ</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và quản lý công nợ của người thuê.</p>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Outstanding */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="bg-primary/5 absolute -top-4 -right-4 h-24 w-24 rounded-full blur-xl transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 mb-3 flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Tổng Công Nợ</span>
          </div>
          <div className="relative z-10 text-2xl font-bold text-slate-900 tabular-nums">
            {stats.totalOutstanding.toLocaleString()} ₫
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined text-[14px]">trending_flat</span>
            <span className="text-xs font-medium">Chưa có dữ liệu</span>
          </div>
        </div>

        {/* Overdue > 30 Days */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-red-500/5 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Quá hạn &gt; 30 ngày</span>
          </div>
          <div className="relative z-10 text-2xl font-bold text-red-600 tabular-nums">
            {stats.overdueMoreThan30Days.toLocaleString()} ₫
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-1 text-slate-500">
            <span className="text-xs font-medium">Chưa có dữ liệu</span>
          </div>
        </div>

        {/* Overdue 1-30 Days */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-amber-500/5 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Quá hạn 1-30 ngày</span>
          </div>
          <div className="relative z-10 text-2xl font-bold text-amber-600 tabular-nums">
            {stats.overdueWithin30Days.toLocaleString()} ₫
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-1 text-slate-500">
            <span className="text-xs font-medium">Chưa có dữ liệu</span>
          </div>
        </div>

        {/* Not Yet Due */}
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
          <div className="relative z-10 mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
            </div>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Trong hạn (Chưa đến hạn)
            </span>
          </div>
          <div className="relative z-10 text-2xl font-bold text-slate-900 tabular-nums">
            {stats.currentNotDue.toLocaleString()} ₫
          </div>
          <div className="relative z-10 mt-2 flex items-center gap-1 text-slate-500">
            <span className="text-xs font-medium">Chưa có dữ liệu</span>
          </div>
        </div>
      </div>

      {/* Main Data Section */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Toolbar & Filters */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-4 md:flex-row">
          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-slate-400">
                search
              </span>
              <Input
                className="bg-white pl-10"
                placeholder="Tìm kiếm người thuê, hóa đơn..."
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="hidden h-6 w-[1px] bg-slate-200 md:block"></div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-slate-500">Lọc theo:</span>
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: val === 'all' ? undefined : (val as InvoiceStatus),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[130px] bg-white">
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
          <div className="w-full text-left text-sm text-slate-500 md:w-auto md:text-right">Hiển thị 1-10 của 41</div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold whitespace-nowrap text-slate-500 uppercase">Người Thuê</TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-slate-500 uppercase">Mã Hóa Đơn</TableHead>
                <TableHead className="text-right font-semibold whitespace-nowrap text-slate-500 uppercase">
                  Tổng Tiền
                </TableHead>
                <TableHead className="text-right font-semibold whitespace-nowrap text-slate-500 uppercase">
                  Đã Trả
                </TableHead>
                <TableHead className="text-right font-semibold whitespace-nowrap text-slate-500 uppercase">
                  Công Nợ Còn Lại
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-slate-500 uppercase">
                  Hạn Thanh Toán
                </TableHead>
                <TableHead className="font-semibold whitespace-nowrap text-slate-500 uppercase">Trạng Thái</TableHead>
                <TableHead className="text-right font-semibold whitespace-nowrap text-slate-500 uppercase">
                  Thao Tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : debts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    Không có công nợ nào
                  </TableCell>
                </TableRow>
              ) : (
                debts.map((debt, index) => {
                  const invoice = debt.invoice
                  if (!invoice) return null
                  const isOverdue = debt.status === 'OVERDUE'
                  const isWarning = invoice.status === InvoiceStatus.UNPAID && index % 2 === 1 // mock logic

                  return (
                    <TableRow
                      key={debt.id}
                      className={`group transition-colors hover:bg-slate-50/80 ${isOverdue ? 'bg-red-50/30' : isWarning ? 'bg-amber-50/30' : ''}`}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold shadow-sm ${
                              isOverdue
                                ? 'bg-red-100 text-red-600'
                                : isWarning
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {invoice.renter?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{invoice.renter?.fullName}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{invoice.room?.title}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/hoa-don/${invoice.id}`} className="text-primary font-medium hover:underline">
                          {invoice.invoiceCode}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-slate-600 tabular-nums">
                        {debt.originalAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 tabular-nums">
                        {debt.paidAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell
                        className={`text-right text-base font-bold tabular-nums ${isOverdue ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}
                      >
                        {debt.remainingAmount.toLocaleString()} ₫
                      </TableCell>
                      <TableCell className="text-slate-600 tabular-nums">
                        {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('vi-VN') : '-'}
                      </TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <span className="inline-flex items-center rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-600"></span>
                            Quá hạn
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Sắp đến hạn
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            Trong hạn
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            title="Nhắc nhở Zalo"
                          >
                            <span className="material-symbols-outlined text-[18px]">chat</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            title="Nhắc nhở Email"
                          >
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div className="text-sm text-slate-500">
            Hiển thị {debts.length > 0 ? (filters.page! - 1) * filters.limit! + 1 : 0} đến{' '}
            {Math.min(filters.page! * filters.limit!, total)} trong số {total} mục
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              {filters.page}
            </Button>
            {/* Simple pagination logic for demo */}
            {total > filters.page! * filters.limit! && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
