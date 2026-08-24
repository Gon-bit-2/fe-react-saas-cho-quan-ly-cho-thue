import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Search, Download, Users, UserCheck, UserMinus, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminLandlordApi } from '../api/tenant.api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function getStatusInfo(status: string) {
  if (status === 'ACTIVE') return { label: 'Hoạt động', color: 'text-emerald-600', dot: 'bg-emerald-500' }
  if (status === 'INACTIVE') return { label: 'Tạm khóa', color: 'text-amber-600', dot: 'bg-amber-500' }
  if (status === 'BANNED') return { label: 'Đình chỉ', color: 'text-red-600', dot: 'bg-red-500' }
  return { label: status, color: 'text-slate-600', dot: 'bg-slate-500' }
}

export const LandlordsPage = () => {
  const [search, setSearch] = useState('')
  const landlords = useQuery({
    queryKey: ['admin', 'landlords', search],
    queryFn: () => adminLandlordApi.list({ page: 1, limit: 100, ...(search ? { search } : {}) }).then((r) => r.data),
  })

  const stats = useQuery({
    queryKey: ['admin', 'landlords', 'stats'],
    queryFn: () => adminLandlordApi.getStats().then((r) => r.data),
  })

  const statsData = stats.data || { total: 0, active: 0, locked: 0 }

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-[1440px] flex-col gap-6 pb-12 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý chủ trọ</h1>
        <p className="mt-2 text-sm text-slate-500">
          Quản lý và giám sát tất cả tài khoản chủ trọ trên hệ thống.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-md shadow-blue-200">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="mb-2 text-xs font-bold tracking-wider text-blue-800/70 uppercase">Tổng số chủ trọ</div>
          <div className="mb-3 text-4xl font-black text-blue-950">
            {stats.isLoading ? '...' : statsData.total.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Cập nhật liên tục
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-100/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
          <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 shadow-md shadow-emerald-200">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div className="mb-2 text-xs font-bold tracking-wider text-emerald-800/70 uppercase">Tài khoản hoạt động</div>
          <div className="mb-3 text-4xl font-black text-emerald-950">
            {stats.isLoading ? '...' : statsData.active.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-700">
            <span className="material-symbols-outlined text-[16px]">show_chart</span>
            Tăng trưởng ổn định
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-red-100/50 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
          <div className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-100">
            <UserMinus className="h-6 w-6 text-red-600" />
          </div>
          <div className="mb-2 text-xs font-bold tracking-wider text-red-800/70 uppercase">Khóa / Vô hiệu hóa</div>
          <div className="mb-3 text-4xl font-black text-red-950">
            {stats.isLoading ? '...' : statsData.locked.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-red-600">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Cần theo dõi
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
              <span className="material-symbols-outlined text-blue-600">format_list_bulleted</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh sách Chủ trọ</h2>
              <p className="text-sm text-slate-500">Quản lý và giám sát các tài khoản chủ trọ.</p>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm chủ trọ..."
                className="rounded-lg border-slate-200 bg-slate-50 pl-9 focus-visible:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100">
                <TableHead className="h-12 pl-6 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Chủ trọ
                </TableHead>
                <TableHead className="h-12 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Người sở hữu
                </TableHead>
                <TableHead className="h-12 text-center text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Xác thực
                </TableHead>
                <TableHead className="h-12 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Trạng thái
                </TableHead>
                <TableHead className="h-12 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Gói dịch vụ
                </TableHead>
                <TableHead className="h-12 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landlords.isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {landlords.isError && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-red-600">
                    Không thể tải danh sách chủ trọ.
                  </TableCell>
                </TableRow>
              )}
              {landlords.data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Không tìm thấy chủ trọ phù hợp.
                  </TableCell>
                </TableRow>
              )}
              {landlords.data?.data.map((landlord) => {
                const verified = Boolean(landlord.emailVerifiedAt || landlord.phoneVerifiedAt)
                const statusInfo = getStatusInfo(landlord.status)

                // Get plan from the first owned tenant's active subscription
                let activePlanName = 'Chưa đăng ký'
                let planStatus = 'Quá hạn'
                if (landlord.ownedTenants?.length > 0) {
                  const firstTenant = landlord.ownedTenants[0]
                  if (firstTenant.subscriptions && firstTenant.subscriptions.length > 0) {
                    const sub = firstTenant.subscriptions[0]
                    activePlanName = sub.plan.name
                    if (sub.status === 'ACTIVE') {
                      planStatus = 'Hoạt động'
                    } else {
                      planStatus = 'Quá hạn'
                    }
                  }
                }

                return (
                  <TableRow
                    key={landlord.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50/80"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarFallback className="bg-blue-100 text-sm font-bold text-blue-700">
                            {landlord.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            to={`/admin/chu-tro/${landlord.id}`}
                            className="font-bold text-slate-900 transition-colors hover:text-blue-600"
                          >
                            {landlord.fullName}
                          </Link>
                          <span className="text-sm text-slate-500">
                            {landlord.phone || landlord.email || 'Chưa cập nhật'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{landlord.fullName}</span>
                        <span className="mt-0.5 font-mono text-xs text-slate-400">
                          ID: LL-{landlord.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
                        {verified ? (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span className={`text-xs font-bold ${verified ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {verified ? 'Mức 2' : 'Mức 1'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`}></span>
                        <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-sm font-medium text-slate-700">{activePlanName}</span>
                        {planStatus === 'Hoạt động' && (
                          <Badge className="border-transparent bg-emerald-100 px-1.5 py-0 text-[10px] font-bold tracking-wider text-emerald-700 uppercase hover:bg-emerald-200">
                            Hoạt động
                          </Badge>
                        )}
                        {planStatus === 'Sắp hết hạn' && (
                          <Badge className="border-transparent bg-amber-100 px-1.5 py-0 text-[10px] font-bold tracking-wider text-amber-700 uppercase hover:bg-amber-200">
                            Sắp hết hạn
                          </Badge>
                        )}
                        {planStatus === 'Quá hạn' && (
                          <Badge className="border-transparent bg-red-100 px-1.5 py-0 text-[10px] font-bold tracking-wider text-red-700 uppercase hover:bg-red-200">
                            Quá hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Link to={`/admin/chu-tro/${landlord.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {landlords.data && (
          <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/50 p-4 px-6 text-sm text-slate-500">
            <span>
              Hiển thị 1 đến {Math.min(landlords.data.data.length, 100)} của{' '}
              {landlords.data.meta.total.toLocaleString()} kết quả
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md bg-white text-slate-400 hover:text-slate-700"
                disabled
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-md border-blue-600 bg-blue-600 p-0 font-medium text-white hover:bg-blue-700 hover:text-white"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-md bg-white p-0 font-medium text-slate-600 hover:bg-slate-50"
              >
                2
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-md bg-white p-0 font-medium text-slate-600 hover:bg-slate-50"
              >
                3
              </Button>
              <span className="mx-1 text-slate-400">...</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md bg-white text-slate-600 hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
