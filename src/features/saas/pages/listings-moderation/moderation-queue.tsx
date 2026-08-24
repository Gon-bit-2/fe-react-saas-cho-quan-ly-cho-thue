import { useState } from 'react'
import { Link } from 'react-router'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAdminModerationRooms } from '@/shared/api/admin'
import { Hourglass, CheckCircle2, XCircle, Search, CalendarDays, Eye, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ModerationQueuePage() {
  const [params, setParams] = useState({ page: 1, limit: 12 })
  const { data: response, isLoading: loading } = useAdminModerationRooms(params)
  const pending = useAdminModerationRooms({ page: 1, limit: 1, marketplaceStatus: 'PENDING_REVIEW' })
  const published = useAdminModerationRooms({ page: 1, limit: 1, marketplaceStatus: 'PUBLISHED' })
  const rejected = useAdminModerationRooms({ page: 1, limit: 1, marketplaceStatus: 'REJECTED' })

  const listings = response?.data || []

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200">Chờ duyệt</Badge>
      case 'PUBLISHED':
        return (
          <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Đã duyệt</Badge>
        )
      case 'REJECTED':
        return <Badge className="border-transparent bg-red-100 text-red-700 hover:bg-red-200">Từ chối</Badge>
      case 'HIDDEN':
        return <Badge className="border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200">Bị ẩn</Badge>
      default:
        return <Badge className="border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200">Bản nháp</Badge>
    }
  }

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-[1440px] flex-col gap-6 pb-12 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hàng chờ kiểm duyệt tin phòng</h1>
        <p className="mt-2 text-sm text-slate-500">
          Quản lý và phê duyệt các tin đăng phòng từ các tenant trên marketplace.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">CHỜ DUYỆT</p>
            <p className="text-4xl font-bold text-slate-900">{pending.data?.meta.total ?? '—'}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-100">
            <Hourglass className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">ĐÃ DUYỆT HÔM NAY</p>
            <p className="text-4xl font-bold text-slate-900">{published.data?.meta.total ?? '—'}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">TỪ CHỐI</p>
            <p className="text-4xl font-bold text-slate-900">{rejected.data?.meta.total ?? '—'}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col items-center gap-4 rounded-t-xl border-b border-slate-100 bg-slate-50/50 p-4 md:flex-row">
          <div className="relative w-full flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Tìm kiếm theo Tên phòng/Tenant..." className="border-slate-200 bg-white pl-9" />
          </div>
          <div className="flex w-full flex-wrap gap-4 md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full border-slate-200 bg-white md:w-48">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
                <SelectItem value="PUBLISHED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
                <SelectItem value="HIDDEN">Bị ẩn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
              Khoảng thời gian
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-6 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  HÌNH ẢNH
                </TableHead>
                <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">TÊN PHÒNG</TableHead>
                <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">TENANT</TableHead>
                <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">NGÀY GỬI</TableHead>
                <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">TRẠNG THÁI</TableHead>
                <TableHead className="pr-6 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                  THAO TÁC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                      Đang tải danh sách...
                    </div>
                  </TableCell>
                </TableRow>
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    Chưa có tin đăng nào cần kiểm duyệt.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-slate-50/80">
                    <TableCell className="py-4 pl-6">
                      <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                        {listing.images?.[0]?.url ? (
                          <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="max-w-xs truncate font-semibold text-slate-900" title={listing.title}>
                        {listing.title}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-slate-600">
                        {listing.property?.name || 'Tài khoản chưa cập nhật'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-slate-500">
                        {formatDistanceToNow(new Date(listing.createdAt || new Date()), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getStatusDisplay(listing.marketplaceStatus || 'DRAFT')}</TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Link to={`/admin/kiem-duyet/chi-tiet/${listing.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/30 p-4 text-sm text-slate-500">
          <span>
            Hiển thị {listings.length === 0 ? 0 : (params.page - 1) * params.limit + 1} đến{' '}
            {(params.page - 1) * params.limit + listings.length} trong {response?.meta.total ?? 0} mục
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 bg-white text-slate-600"
              disabled={params.page <= 1}
              onClick={() => setParams((current) => ({ ...current, page: current.page - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-md border-blue-600 bg-blue-600 p-0 font-medium text-white hover:bg-blue-700 hover:text-white"
            >
              {params.page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 bg-white text-slate-600"
              disabled={params.page >= (response?.meta.totalPages ?? 1)}
              onClick={() => setParams((current) => ({ ...current, page: current.page + 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
