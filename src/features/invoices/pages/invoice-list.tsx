import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { getInvoices } from '../api'
import { InvoiceStatus, type Invoice, type InvoiceListParams } from '../types'
import { INVOICE_STATUS_MAP } from '@/shared/constants/status-config'
import { useProperties } from '@/shared/api/properties'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import {
  Receipt,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  CreditCard,
  MoreVertical,
  DoorOpen,
  User,
} from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

/**
 * Trang danh sách hóa đơn thu tiền phòng, điện nước và dịch vụ hàng tháng.
 * Cung cấp tổng quan doanh thu, trạng thái công nợ và bộ lọc theo khu trọ, kỳ thu.
 */
export function InvoiceListPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL')

  const [filters, setFilters] = useState<InvoiceListParams>({
    page: 1,
    limit: 10,
  })
  const [total, setTotal] = useState(0)

  // Lấy danh sách khu trọ từ API
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true)
      try {
        const response = await getInvoices(filters)
        setInvoices(response.data)
        setTotal(response.meta.total)
      } catch (error) {
        console.error('Failed to load invoices', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadInvoices()
  }, [filters])

  // Thống kê tài chính từ danh sách hóa đơn hiện tại
  const stats = useMemo(() => {
    let totalExpected = 0
    let totalPaid = 0
    let totalDebt = 0
    let overdueCount = 0

    invoices.forEach((inv) => {
      totalExpected += Number(inv.totalAmount) || 0
      totalPaid += Number(inv.paidAmount) || 0
      totalDebt += Number(inv.debtAmount) || 0
      if (inv.status === InvoiceStatus.OVERDUE) {
        overdueCount++
      }
    })

    return {
      totalExpected,
      totalPaid,
      totalDebt,
      overdueCount,
    }
  }, [invoices])

  const handleFilterChange = (key: keyof InvoiceListParams, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }))
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Hóa Đơn</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lập, theo dõi và đối soát hóa đơn tiền phòng, điện nước và dịch vụ của người thuê
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
            <Link to="/hoa-don/cong-no">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Sổ theo dõi nợ
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/hoa-don/tao-moi')}
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Tạo hóa đơn
          </Button>
        </div>
      </div>

      {/* Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng doanh thu dự kiến"
          value={formatCurrency(stats.totalExpected)}
          description="Doanh số toàn bộ hóa đơn kỳ này"
          icon={<Receipt className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Thực thu đã nhận"
          value={formatCurrency(stats.totalPaid)}
          description="Tiền đã về tài khoản hoặc tiền mặt"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <MetricCard
          title="Công nợ còn tồn"
          value={formatCurrency(stats.totalDebt)}
          description="Khoản chưa thu từ người thuê"
          icon={<Clock className="h-5 w-5" />}
          tone={stats.totalDebt > 0 ? "amber" : "slate"}
        />
        <MetricCard
          title="Hóa đơn quá hạn"
          value={`${stats.overdueCount} HĐ`}
          description={stats.overdueCount > 0 ? "Cần gửi thông báo nhắc nợ" : "Không có hóa đơn trễ hạn"}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone={stats.overdueCount > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:grid-cols-12">
        {/* Tìm kiếm */}
        <div className="relative sm:col-span-6 lg:col-span-4">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm mã hóa đơn, tên người thuê, phòng..."
            className="h-9 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Lọc Khu trọ */}
        <div className="sm:col-span-3 lg:col-span-3">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="h-9 bg-slate-50 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="Tất cả khu trọ" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả khu trọ</SelectItem>
              {properties.map((p: Property) => (
                <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lọc Kỳ hóa đơn (Tháng) */}
        <div className="sm:col-span-3 lg:col-span-3">
          <Input
            type="month"
            className="h-9 bg-slate-50 text-xs"
            onChange={(e) =>
              handleFilterChange('billingMonth', e.target.value ? `${e.target.value}-01` : undefined)
            }
          />
        </div>

        {/* Lọc Trạng thái */}
        <div className="sm:col-span-6 lg:col-span-2">
          <Select
            onValueChange={(val) =>
              handleFilterChange('status', val === 'all' ? undefined : (val as InvoiceStatus))
            }
          >
            <SelectTrigger className="h-9 bg-slate-50 text-xs">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
              <SelectItem value={InvoiceStatus.DRAFT} className="text-xs">Bản nháp</SelectItem>
              <SelectItem value={InvoiceStatus.UNPAID} className="text-xs">Chờ thanh toán</SelectItem>
              <SelectItem value={InvoiceStatus.PAID} className="text-xs">Đã thanh toán</SelectItem>
              <SelectItem value={InvoiceStatus.OVERDUE} className="text-xs">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table List Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[180px]">Mã hóa đơn</TableHead>
                <TableHead>Kỳ chốt</TableHead>
                <TableHead>Khách thuê & Phòng</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-right">Đã thu</TableHead>
                <TableHead className="text-right">Còn nợ</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState
                      icon={<Receipt className="h-7 w-7 text-slate-400" />}
                      title="Không tìm thấy hóa đơn nào"
                      description={
                        filters.search || filters.status || filters.billingMonth
                          ? "Không có hóa đơn nào khớp với điều kiện lọc hiện tại. Thử xóa bớt bộ lọc."
                          : "Chưa có hóa đơn nào được phát hành. Hãy tạo hóa đơn đầu tiên cho khách thuê."
                      }
                      action={
                        !filters.search && !filters.status ? (
                          <Button
                            size="sm"
                            onClick={() => navigate('/hoa-don/tao-moi')}
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                          >
                            <Plus className="h-4 w-4" /> Tạo hóa đơn ngay
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters({ page: 1, limit: 10 })}
                          >
                            Xóa bộ lọc
                          </Button>
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const isOverdue = invoice.status === InvoiceStatus.OVERDUE || (invoice.debtAmount > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date())
                  return (
                    <TableRow key={invoice.id} className="transition-colors hover:bg-slate-50/80">
                      <TableCell className="font-medium text-slate-900">
                        <Link
                          to={`/hoa-don/${invoice.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {invoice.invoiceCode}
                        </Link>
                      </TableCell>

                      <TableCell className="text-slate-600 text-xs">
                        {invoice.billingMonth
                          ? new Date(invoice.billingMonth).toLocaleDateString('vi-VN', {
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{invoice.renter?.fullName || 'Khách thuê'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <DoorOpen className="h-3 w-3 text-slate-400" />
                          <span>{invoice.room?.title || `Phòng ${invoice.room?.roomCode || ''}`}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-right font-semibold tabular-nums text-slate-900">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>

                      <TableCell className="font-mono text-right font-medium tabular-nums text-emerald-600">
                        {formatCurrency(invoice.paidAmount)}
                      </TableCell>

                      <TableCell className={`font-mono text-right font-bold tabular-nums ${invoice.debtAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatCurrency(invoice.debtAmount)}
                      </TableCell>

                      <TableCell className="text-xs">
                        {invoice.dueDate ? (
                          <span className={isOverdue ? 'font-semibold text-rose-600' : 'text-slate-600'}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <StatusBadge
                          status={invoice.status}
                          statusMap={INVOICE_STATUS_MAP}
                          fallbackLabel={invoice.status}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem asChild>
                              <Link to={`/hoa-don/${invoice.id}`} className="flex cursor-pointer items-center">
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                Xem chi tiết
                              </Link>
                            </DropdownMenuItem>

                            {invoice.status === InvoiceStatus.DRAFT && (
                              <DropdownMenuItem asChild>
                                <Link to={`/hoa-don/${invoice.id}/chinh-sua`} className="flex cursor-pointer items-center">
                                  <Edit3 className="mr-2 h-4 w-4 text-slate-500" />
                                  Sửa bản nháp
                                </Link>
                              </DropdownMenuItem>
                            )}

                            {invoice.debtAmount > 0 && (
                              <DropdownMenuItem asChild>
                                <Link to={`/hoa-don/${invoice.id}`} className="flex cursor-pointer items-center text-emerald-600 font-medium">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Thu tiền phòng
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500">
            <div>
              Hiển thị <span className="font-medium text-slate-700">{(filters.page! - 1) * filters.limit! + 1}</span> -{' '}
              <span className="font-medium text-slate-700">{Math.min(filters.page! * filters.limit!, total)}</span> trên tổng số{' '}
              <span className="font-medium text-slate-700">{total}</span> hóa đơn
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1 text-xs"
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', filters.page! - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
                {filters.page}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1 text-xs"
                disabled={filters.page! * filters.limit! >= total}
                onClick={() => handleFilterChange('page', filters.page! + 1)}
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
