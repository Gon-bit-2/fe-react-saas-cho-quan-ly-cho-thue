import { useParams, useNavigate } from 'react-router'
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { CONTRACT_STATUS_MAP, VERIFICATION_STATUS_MAP } from '@/shared/constants/status-config'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRenter, useRenterHistory } from '@/shared/api/renters'
import { formatDate } from '@/shared/lib/utils'

/**
 * Trang chi tiết người thuê
 * Hiển thị thông tin định danh, liên hệ, tình trạng xác minh và toàn bộ lịch sử thuê phòng trong tenant
 */
export default function Component() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: renter, isLoading, isError } = useRenter(id)
  const { data: history } = useRenterHistory(id)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="font-medium text-slate-500">Đang tải thông tin người thuê...</p>
      </div>
    )
  }

  if (isError || !renter) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="font-medium text-red-600">Không tìm thấy thông tin người thuê này.</p>
        <Button variant="outline" onClick={() => navigate('/nguoi-thue')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const currentStatus = renter.renterProfile?.verificationStatus || renter.verificationStatus || 'UNVERIFIED'

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-900"
        onClick={() => navigate('/nguoi-thue')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách người thuê
      </Button>

      {/* Profile Header Banner */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="relative px-6 pt-0 pb-6">
          <div className="-mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-sm">
                <AvatarFallback className="bg-slate-100 text-xl font-bold text-slate-700">
                  {renter.fullName
                    .split(' ')
                    .slice(-2)
                    .map((part) => part[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{renter.fullName}</h1>
                  <StatusBadge
                    status={currentStatus}
                    statusMap={VERIFICATION_STATUS_MAP}
                    fallbackLabel={currentStatus}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 tabular-nums">
                  Tham gia hệ thống từ {formatDate(renter.createdAt)}
                </p>
              </div>
            </div>

            <Button
              className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 sm:self-center"
              onClick={() => navigate(`/hop-dong/tao?renterId=${renter.id}`)}
            >
              <FileText className="mr-2 h-4 w-4" /> Tạo hợp đồng cho khách này
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{renter.email}</span>
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</span>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 tabular-nums">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{renter.phone || 'Chưa cập nhật'}</span>
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CCCD/CMND</span>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 tabular-nums">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{renter.identityNumber || renter.renterProfile?.identityNumber || 'Chưa cập nhật'}</span>
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày sinh</span>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 tabular-nums">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {renter.renterProfile?.dateOfBirth ? formatDate(renter.renterProfile.dateOfBirth) : 'Chưa cập nhật'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-slate-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-semibold"
          >
            Thông tin chi tiết
          </TabsTrigger>
          <TabsTrigger
            value="contracts"
            className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-3 text-slate-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 font-semibold"
          >
            Lịch sử thuê ({history?.data.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" /> Thông tin cư trú & Hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Địa chỉ thường trú
                </span>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    {renter.permanentAddress || renter.renterProfile?.permanentAddress || 'Chưa có thông tin'}
                  </span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nghề nghiệp
                  </span>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {renter.renterProfile?.occupation || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ghi chú nội bộ
                  </span>
                  <p className="mt-1 text-sm text-slate-600 italic">
                    {renter.renterProfile?.bio || 'Không có ghi chú.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-6 space-y-4">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Các hợp đồng đã và đang thuê
              </CardTitle>
              <CardDescription>
                Toàn bộ lịch sử các phòng trọ khách hàng đã từng ký hợp đồng trong tổ chức của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!history?.data.length ? (
                <div className="py-8 text-center text-slate-500">Chưa có lịch sử hợp đồng nào trong tenant này.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.data.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 hover:bg-slate-50/80 px-3 rounded-lg transition-colors cursor-pointer"
                      onClick={() => navigate(`/hop-dong/${item.contractId}`)}
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-base">
                          {item.room.title} ({item.room.roomCode})
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {item.room.property.name} • Từ {formatDate(item.startedAt)}
                          {item.endedAt ? ` đến ${formatDate(item.endedAt)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge
                          status={item.status}
                          statusMap={CONTRACT_STATUS_MAP}
                          fallbackLabel={item.status}
                        />
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600">
                          Chi tiết <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
