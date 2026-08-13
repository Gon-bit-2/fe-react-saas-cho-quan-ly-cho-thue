import React from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, HeartPulse, CreditCard, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRenter } from '@/shared/api/renters'

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 rounded-md bg-slate-100 p-2 text-slate-500">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value || <span className="text-slate-400 italic">Chưa cập nhật</span>}</div>
    </div>
  </div>
)

export default function RenterDetailPage() {
  const { id } = useParams()
  const { data: renter, isLoading } = useRenter(Number(id))

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Đang tải dữ liệu...</div>
  }

  if (!renter) {
    return <div className="p-6 text-center text-slate-500">Người thuê không tồn tại</div>
  }

  const getStatusBadge = () => {
    switch (renter.verificationStatus) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã xác minh</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ xác minh</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Từ chối</Badge>
      case 'UNVERIFIED':
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Chưa xác minh</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/nguoi-thue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{renter.fullName}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-slate-500 mt-1">Chi tiết hồ sơ và lịch sử thuê phòng.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Chỉnh sửa hồ sơ</Button>
          <Button>Tạo hợp đồng</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Hồ sơ cá nhân</TabsTrigger>
          <TabsTrigger value="history">Lịch sử thuê phòng</TabsTrigger>
          <TabsTrigger value="documents">Giấy tờ & Định danh</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InfoItem icon={Mail} label="Địa chỉ Email" value={renter.email} />
                <InfoItem icon={Phone} label="Số điện thoại" value={renter.phone} />
                <InfoItem icon={MapPin} label="Thường trú" value={renter.permanentAddress} />
                <InfoItem icon={Briefcase} label="Nghề nghiệp" value={renter.occupation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InfoItem icon={User} label="Giới tính" value={renter.gender === 'MALE' ? 'Nam' : renter.gender === 'FEMALE' ? 'Nữ' : renter.gender ? 'Khác' : null} />
                <InfoItem icon={Clock} label="Ngày sinh" value={renter.dateOfBirth ? new Date(renter.dateOfBirth).toLocaleDateString('vi-VN') : null} />
                <InfoItem icon={CreditCard} label="Số CCCD/CMND" value={renter.identityNumber} />
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Liên hệ khẩn cấp</h4>
                  <div className="space-y-4">
                    <InfoItem icon={User} label="Họ tên người thân" value={renter.emergencyContactName} />
                    <InfoItem icon={HeartPulse} label="Số điện thoại" value={renter.emergencyContactPhone} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6 text-center text-slate-500 py-12">
              Chưa có lịch sử hợp đồng nào.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Mặt trước CCCD/CMND</h4>
                  {renter.identityFrontUrl ? (
                    <img src={renter.identityFrontUrl} alt="Mặt trước" className="rounded-lg border border-slate-200 w-full object-cover max-h-64" />
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">Chưa cập nhật ảnh</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Mặt sau CCCD/CMND</h4>
                  {renter.identityBackUrl ? (
                    <img src={renter.identityBackUrl} alt="Mặt sau" className="rounded-lg border border-slate-200 w-full object-cover max-h-64" />
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm">Chưa cập nhật ảnh</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
