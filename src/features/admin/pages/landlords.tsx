import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Search, Mail, Phone, Verified } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminLandlordApi } from '../api/tenant.api'

function statusLabel(status: string) {
  if (status === 'ACTIVE') return 'Hoạt động'
  if (status === 'INACTIVE') return 'Tạm khóa'
  if (status === 'BANNED') return 'Bị cấm'
  return status
}

export const LandlordsPage = () => {
  const [search, setSearch] = useState('')
  const landlords = useQuery({
    queryKey: ['admin', 'landlords', search],
    queryFn: () => adminLandlordApi.list({ page: 1, limit: 100, ...(search ? { search } : {}) }).then(r => r.data),
  })

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chủ trọ</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tài khoản có vai trò chủ trọ trên toàn hệ thống</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Tìm chủ trọ"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chủ trọ</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Khu trọ sở hữu</TableHead>
              <TableHead>Xác thực</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landlords.isLoading && (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Đang tải dữ liệu...</TableCell></TableRow>
            )}
            {landlords.isError && (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-600">Không thể tải danh sách chủ trọ.</TableCell></TableRow>
            )}
            {landlords.data?.data.length === 0 && (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Không tìm thấy chủ trọ.</TableCell></TableRow>
            )}
            {landlords.data?.data.map(landlord => {
              const verified = Boolean(landlord.emailVerifiedAt || landlord.phoneVerifiedAt)
              return (
                <TableRow key={landlord.id}>
                  <TableCell>
                    <Link to={`/admin/chu-tro/${landlord.id}`} className="font-semibold text-foreground hover:text-primary">
                      {landlord.fullName}
                    </Link>
                    <div className="text-xs text-muted-foreground">ID: {landlord.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{landlord.email || 'Chưa cập nhật'}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{landlord.phone || 'Chưa cập nhật'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{landlord.ownedTenants.length}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      {verified && <Verified className="h-4 w-4 text-primary" />}
                      {verified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={landlord.status === 'BANNED' ? 'destructive' : 'secondary'}>{statusLabel(landlord.status)}</Badge></TableCell>
                  <TableCell>{new Date(landlord.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {landlords.data && (
          <div className="border-t p-4 text-sm text-muted-foreground">Tổng cộng {landlords.data.meta.total} chủ trọ</div>
        )}
      </div>
    </div>
  )
}
