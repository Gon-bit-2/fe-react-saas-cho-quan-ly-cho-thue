import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { Mail, Phone, Building2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { adminLandlordApi, type Landlord } from '../api/tenant.api'

function statusLabel(status: Landlord['status']) {
  if (status === 'ACTIVE') return 'Hoạt động'
  if (status === 'INACTIVE') return 'Tạm khóa'
  return 'Bị cấm'
}

export const LandlordDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const landlordId = Number(id)
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Landlord['status']>('ACTIVE')
  const [reason, setReason] = useState('')

  const landlord = useQuery({
    queryKey: ['admin', 'landlord', landlordId],
    queryFn: () => adminLandlordApi.get(landlordId).then(r => r.data),
    enabled: Number.isInteger(landlordId) && landlordId > 0,
  })

  const updateStatus = useMutation({
    mutationFn: () => adminLandlordApi.updateStatus(landlordId, { status, reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'landlord', landlordId] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'landlords'] })
      setReason('')
      toast.success('Đã cập nhật trạng thái tài khoản')
    },
    onError: () => toast.error('Không thể cập nhật trạng thái tài khoản'),
  })

  if (landlord.isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin chủ trọ...</div>
  if (!landlord.data) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin chủ trọ.</div>

  const data = landlord.data

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
      <div>
        <Link to="/admin/chu-tro" className="text-sm font-semibold text-primary">← Danh sách chủ trọ</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{data.fullName}</h1>
          <Badge variant={data.status === 'BANNED' ? 'destructive' : 'secondary'}>{statusLabel(data.status)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">ID tài khoản: {data.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Thông tin tài khoản</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><div className="text-muted-foreground">Email</div><div>{data.email || 'Chưa cập nhật'}</div></div></div>
            <div className="flex gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><div className="text-muted-foreground">Số điện thoại</div><div>{data.phone || 'Chưa cập nhật'}</div></div></div>
            <div className="flex gap-3"><Clock className="h-5 w-5 text-muted-foreground" /><div><div className="text-muted-foreground">Đăng nhập gần nhất</div><div>{data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}</div></div></div>
            <div className="border-t pt-3 text-muted-foreground">
              Email: {data.emailVerifiedAt ? 'đã xác thực' : 'chưa xác thực'} · Điện thoại: {data.phoneVerifiedAt ? 'đã xác thực' : 'chưa xác thực'}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Khu trọ sở hữu ({data.ownedTenants.length})</CardTitle></CardHeader>
          <CardContent>
            {data.ownedTenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tài khoản chưa sở hữu khu trọ nào.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.ownedTenants.map(tenant => (
                  <div key={tenant.id} className="flex items-start gap-3 rounded-lg border p-4">
                    <Building2 className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{tenant.name}</div>
                      <div className="text-xs text-muted-foreground">{tenant.slug}</div>
                      <div className="mt-2 flex gap-2"><Badge variant="outline">{tenant.status}</Badge><Badge variant="outline">{tenant.verificationStatus}</Badge></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quản lý trạng thái</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Trạng thái mới</Label>
            <Select value={status} onValueChange={value => setStatus(value as Landlord['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Tạm khóa</SelectItem>
                <SelectItem value="BANNED">Bị cấm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-reason">Lý do</Label>
            <Textarea id="status-reason" value={reason} onChange={event => setReason(event.target.value)} placeholder="Nhập lý do thay đổi (tối thiểu 3 ký tự)" />
          </div>
          <Button disabled={reason.trim().length < 3 || updateStatus.isPending || status === data.status} onClick={() => updateStatus.mutate()}>
            {updateStatus.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
