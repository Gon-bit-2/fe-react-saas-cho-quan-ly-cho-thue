import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { PAYMENT_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/shared/constants/status-config'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useProperties } from '@/shared/api/properties'
import { getPayments } from '../api/index'
import { PaymentStatus, PaymentMethod, type PaymentListParams } from '../types/index'
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  Receipt,
  FileDown,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Banknote,
  Wallet,
  Eye,
  Check,
} from 'lucide-react'

/**
 * Trang quản lý và đối soát danh sách thanh toán từ người thuê
 * Cung cấp bộ lọc theo bất động sản, trạng thái, phương thức và công cụ duyệt nhanh
 */
export function PaymentListPage() {
  const navigate = useNavigate()
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []
  const [filters, setFilters] = useState<PaymentListParams>({
    page: 1,
    limit: 10,
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /**
   * Tải danh sách thanh toán từ server qua TanStack Query (tránh cascading render từ useEffect)
   */
  const {
    data: paymentsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => getPayments(filters),
  })

  const payments = useMemo(() => paymentsResponse?.data || [], [paymentsResponse])
  const total = paymentsResponse?.meta?.total || 0

  /**
   * Tính toán thống kê nhanh từ danh sách thanh toán
   */
  const stats = useMemo(() => {
    const pendingCount = payments.filter((p) => p.status === PaymentStatus.PENDING).length
    const successPayments = payments.filter((p) => p.status === PaymentStatus.SUCCESS)
    const totalReconciled = successPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const pendingAmount = payments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      pendingCount,
      pendingAmount,
      totalReconciled,
      successCount: successPayments.length,
    }
  }, [payments])

  /**
   * Sao chép mã giao dịch vào clipboard
   */
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  /**
   * Hiển thị biểu tượng và nhãn cho từng phương thức thanh toán
   */
  const renderMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER:
        return (
          <div className="flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            <QrCode className="h-3.5 w-3.5 text-blue-600" />
            <span>Chuyển khoản / QR</span>
          </div>
        )
      case PaymentMethod.CASH:
        return (
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tiền mặt</span>
          </div>
        )
      case PaymentMethod.WALLET:
        return (
          <div className="flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            <Wallet className="h-3.5 w-3.5 text-amber-600" />
            <span>Ví điện tử</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            <CreditCard className="h-3.5 w-3.5" />
            <span>{PAYMENT_METHOD_MAP[method]?.label || (typeof method === 'string' ? method : 'Khác')}</span>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút thao tác chính */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đối Soát Thanh Toán</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra chứng từ, phê duyệt thanh toán và đối soát dòng tiền theo từng phòng trọ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileDown className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Thống kê KPI tổng hợp */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Chờ Phê Duyệt"
          value={stats.pendingCount}
          description={`Tổng tiền chờ: ${formatCurrency(stats.pendingAmount)}`}
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
        />
        <MetricCard
          title="Đã Khớp Thành Công"
          value={stats.successCount}
          description="Giao dịch hợp lệ kỳ này"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
        <MetricCard
          title="Tổng Tiền Đã Thu"
          value={formatCurrency(stats.totalReconciled)}
          description="Đã hạch toán vào hóa đơn"
          icon={<CreditCard className="h-4 w-4" />}
          tone="blue"
        />
      </div>

      {/* Thanh tìm kiếm & Bộ lọc nâng cao */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="relative w-full flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm mã giao dịch, tên người nộp, mã hóa đơn..."
                className="w-full border-slate-200 bg-slate-50 pl-9 text-sm"
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }))}
              />
            </div>

            <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto">
              {/* Lọc theo Khu trọ */}
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    propertyId: val === 'all' ? undefined : val,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[180px] border-slate-200 bg-slate-50 text-sm">
                  <Building2 className="mr-1.5 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Tất cả khu trọ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu trọ</SelectItem>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={String(prop.id)}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lọc theo Trạng thái */}
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: val === 'all' ? undefined : (val as PaymentStatus),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[160px] border-slate-200 bg-slate-50 text-sm">
                  <SelectValue placeholder="Trạng thái: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Chờ duyệt</SelectItem>
                  <SelectItem value={PaymentStatus.SUCCESS}>Đã duyệt</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Từ chối</SelectItem>
                  <SelectItem value={PaymentStatus.CANCELED}>Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              {/* Lọc theo Phương thức */}
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    method: val === 'all' ? undefined : (val as PaymentMethod),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[170px] border-slate-200 bg-slate-50 text-sm">
                  <SelectValue placeholder="Phương thức: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phương thức</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Chuyển khoản / QR</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>Tiền mặt</SelectItem>
                  <SelectItem value={PaymentMethod.WALLET}>Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bảng danh sách giao dịch */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[180px]">Mã Giao Dịch</TableHead>
                <TableHead className="w-[140px]">Mã Hóa Đơn</TableHead>
                <TableHead>Người Thuê / Phòng</TableHead>
                <TableHead className="text-right">Số Tiền</TableHead>
                <TableHead>Phương Thức</TableHead>
                <TableHead>Thời Gian</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="w-[120px] text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={CreditCard}
                      title="Chưa có giao dịch thanh toán"
                      description="Hiện chưa có lịch sử thanh toán nào phù hợp với bộ lọc tìm kiếm của bạn."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="transition-colors hover:bg-slate-50/80">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {payment.transactionCode || `TXN-${payment.id.toString().padStart(6, '0')}`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              payment.transactionCode || `TXN-${payment.id.toString().padStart(6, '0')}`,
                              String(payment.id),
                            )
                          }
                          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          title="Sao chép mã"
                        >
                          {copiedId === String(payment.id) ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    <TableCell>
                      {payment.invoice ? (
                        <Link
                          to={`/hoa-don/${payment.invoice.id}`}
                          className="inline-flex items-center gap-1 font-mono text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Receipt className="h-3 w-3" />
                          {payment.invoice.invoiceCode}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Không xác định</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {payment.payer?.fullName || 'Khách vãng lai'}
                        </span>
                        <span className="text-xs text-slate-500">{payment.room?.title || 'Không rõ phòng'}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </TableCell>

                    <TableCell>{renderMethodBadge(payment.method)}</TableCell>

                    <TableCell>
                      <div className="flex flex-col font-mono text-xs text-slate-600 tabular-nums">
                        <span>{payment.paidAt ? formatDate(payment.paidAt) : '-'}</span>
                        <span className="text-[11px] text-slate-400">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={payment.status} configMap={PAYMENT_STATUS_MAP} size="sm" />
                    </TableCell>

                    <TableCell className="text-right">
                      {payment.status === PaymentStatus.PENDING ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/thanh-toan/${payment.id}/duyet`)}
                          className="h-8 gap-1 bg-amber-600 px-3 text-xs text-white hover:bg-amber-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Duyệt
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/thanh-toan/${payment.id}`)}
                          className="h-8 gap-1 px-2.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <span className="text-xs text-slate-500">
            Hiển thị {payments.length > 0 ? (filters.page! - 1) * filters.limit! + 1 : 0} đến{' '}
            {Math.min(filters.page! * filters.limit!, total)} trong số {total} giao dịch
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              Trang {filters.page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600"
              disabled={total <= filters.page! * filters.limit!}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
