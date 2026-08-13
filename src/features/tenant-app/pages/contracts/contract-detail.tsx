import { Link, useParams } from 'react-router'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useContract } from '@/shared/api/contracts'

export default function ContractDetailPage() {
  const { id } = useParams()
  const { data: contract, isLoading } = useContract(Number(id))

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Đang tải dữ liệu...</div>
  }

  if (!contract) {
    return <div className="p-6 text-center text-slate-500">Hợp đồng không tồn tại</div>
  }

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-700">Đang hiệu lực</Badge>
      case 'DRAFT':
        return <Badge className="bg-slate-100 text-slate-700">Bản nháp</Badge>
      default:
        return <Badge variant="outline">{contract.status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/hop-dong">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Hợp đồng {contract.contractCode}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Đại diện thuê: {contract.renter?.fullName || 'Chưa cập nhật'} — {contract.room?.title || `Phòng ${contract.roomId}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {contract.status === 'DRAFT' && (
            <Button variant="outline" asChild>
              <Link to={`/hop-dong/${id}/sua`}>
                <Edit className="h-4 w-4 mr-2" />
                Sửa bản nháp
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/hop-dong/${id}/thanh-vien`}>Quản lý thành viên</Link>
          </Button>
          {contract.status === 'DRAFT' && (
            <Button>Gửi yêu cầu ký</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
          <TabsTrigger value="terms">Điều khoản & Nội dung</TabsTrigger>
          <TabsTrigger value="assets">Tài sản bàn giao</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thanh toán</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Thời hạn hợp đồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ngày bắt đầu</div>
                    <div className="text-sm font-medium">{new Date(contract.startDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Ngày kết thúc</div>
                    <div className="text-sm font-medium">{new Date(contract.endDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tài chính & Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tiền thuê hàng tháng</div>
                    <div className="text-sm font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.monthlyPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Tiền cọc</div>
                    <div className="text-sm font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.depositAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Chu kỳ thanh toán</div>
                    <div className="text-sm font-medium text-slate-900">
                      {contract.billingCycle === 'MONTHLY' ? 'Hàng tháng' : 'Hàng quý'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Hạn thanh toán</div>
                    <div className="text-sm font-medium text-slate-900">Ngày {contract.paymentDueDay}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none text-sm text-slate-600">
                <h3>Điều khoản hợp đồng thuê nhà</h3>
                <p>Nội dung bản Snapshot lúc ký hợp đồng sẽ được hiển thị ở đây (PDF hoặc HTML Text)...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardContent className="pt-6 text-center text-slate-500 py-12">
              Chưa có biên bản bàn giao tài sản.
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Danh sách thành viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.members && contract.members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contract.members.map((member) => (
                    <div key={member.id} className="flex flex-col gap-2 p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{member.user.fullName}</span>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                      <div className="text-sm text-slate-500">{member.user.email}</div>
                      <div className="text-sm text-slate-500">{member.user.phone}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-12">
                  Chưa có thông tin thành viên.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6 text-center text-slate-500 py-12">
              Tính năng đang phát triển...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
