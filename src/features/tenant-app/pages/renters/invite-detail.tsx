import { useParams, Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    switch (invite.status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-700">Đã chấp nhận</Badge>
      case 'EXPIRED':
        return <Badge className="bg-slate-100 text-slate-700">Đã hết hạn</Badge>
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-700">Đã hủy</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Đang chờ</Badge>
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/nguoi-thue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Chi tiết lời mời</h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gửi tới: {invite.email}
          </p>
        </div>
        {invite.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Hủy lời mời
            </Button>
            <Button variant="secondary">Gửi lại Email</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bỏ Link Invite vì API không còn trả về nữa */}
        <Card className="md:col-span-2 flex flex-col justify-center items-center text-center p-8 bg-slate-50 border-dashed">
            <p className="text-slate-500 mb-2">Lời mời đã được gửi đi qua email tới người dùng.</p>
            <p className="text-sm text-slate-400">Người thuê sẽ nhận được email hướng dẫn và link đăng ký kèm theo.</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Thông tin lời mời</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Người nhận</div>
              <div className="text-sm font-medium text-slate-900">{invite.fullName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Thời gian gửi</div>
              <div className="text-sm text-slate-900">
                {new Date(invite.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Hết hạn vào</div>
              <div className="text-sm text-slate-900">
                {new Date(invite.expiresAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
