import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { INVITE_STATUS_MAP } from '@/shared/constants/status-config'

import { useRenterInvitation } from '@/shared/api/renters'

export default function RenterInviteDetailPage() {
  const { id } = useParams()
  const { data: invite, isLoading } = useRenterInvitation(id || '')

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
  }

  if (!invite) {
    return <div className="p-12 text-center text-slate-500">Không tìm thấy lời mời.</div>
  }

  const getStatusBadge = () => {
    return <StatusBadge status={invite.status} statusMap={INVITE_STATUS_MAP} fallbackLabel={invite.status} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/nguoi-thue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Chi tiết lời mời</h1>
            {getStatusBadge()}
          </div>
          <p className="mt-1 text-sm text-slate-500">Gửi tới: {invite.email}</p>
        </div>
        {invite.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
              Hủy lời mời
            </Button>
            <Button variant="secondary">Gửi lại Email</Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người nhận</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Họ và tên</p>
              <p className="text-base font-medium">{invite.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Số điện thoại</p>
              <p className="text-base font-medium">{invite.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Email</p>
              <p className="text-base font-medium">{invite.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi tiết phòng thuê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Phòng</p>
              <p className="text-base font-medium">
                {invite.room?.title} ({invite.room?.roomCode})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Khu trọ / Tòa nhà</p>
              <p className="text-base font-medium">{invite.property?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Vai trò</p>
              <p className="text-base font-medium">Người thuê chính</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
