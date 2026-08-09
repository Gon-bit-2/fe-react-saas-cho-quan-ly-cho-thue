import React from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RenterInviteDetailPage() {
  const { id } = useParams()

  // Dữ liệu mẫu (thay bằng API)
  const mockInvite = {
    id,
    fullName: 'Lê Văn C',
    email: 'levanc@example.com',
    status: 'PENDING', // PENDING, ACCEPTED, EXPIRED, CANCELLED
    inviteLink: 'https://app.example.com/register?invite=abc-xyz',
    createdAt: '2026-08-08T08:00:00Z',
    expiresAt: '2026-08-15T08:00:00Z',
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockInvite.inviteLink)
    // Cần thêm toast thông báo ở đây
    alert('Đã copy liên kết!')
  }

  const getStatusBadge = () => {
    switch (mockInvite.status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-700">Đã chấp nhận</Badge>
      case 'EXPIRED':
        return <Badge className="bg-slate-100 text-slate-700">Đã hết hạn</Badge>
      case 'CANCELLED':
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
          <Link to="/app/nguoi-thue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Chi tiết lời mời</h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gửi tới: {mockInvite.email}
          </p>
        </div>
        {mockInvite.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Hủy lời mời
            </Button>
            <Button variant="secondary">Gửi lại Email</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Liên kết đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Người thuê có thể sử dụng liên kết dưới đây để tạo tài khoản và tự động tham gia vào hệ thống quản lý của bạn.
            </p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md p-2">
              <code className="text-sm text-slate-700 flex-1 px-2 truncate overflow-hidden">
                {mockInvite.inviteLink}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopyLink} className="shrink-0">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Thông tin lời mời</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Người nhận</div>
              <div className="text-sm font-medium text-slate-900">{mockInvite.fullName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Thời gian gửi</div>
              <div className="text-sm text-slate-900">
                {new Date(mockInvite.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Hết hạn vào</div>
              <div className="text-sm text-slate-900">
                {new Date(mockInvite.expiresAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
