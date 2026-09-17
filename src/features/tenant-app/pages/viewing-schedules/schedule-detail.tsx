import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Calendar, MapPin, Phone, User, Check, X, CheckCircle2, Loader2, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { APPOINTMENT_STATUS_MAP } from '@/shared/constants/status-config'
import { useUpdateViewingAppointmentStatus, useViewingAppointmentForLandlord } from '@/shared/api/viewing-appointments'
import type { AppointmentStatus } from '@/shared/api/generated/models'
import { formatDateTime } from '@/shared/lib/utils'
import { toast } from 'sonner'

/**
 * Trang chi tiết lịch hẹn xem phòng của chủ trọ
 * Hiển thị thông tin khách thuê, thời gian hẹn, phòng hẹn xem và cho phép cập nhật trạng thái lịch hẹn
 */
export function Component() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useViewingAppointmentForLandlord(id)
  const updateStatus = useUpdateViewingAppointmentStatus(id)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="font-medium text-slate-500">Đang tải lịch hẹn...</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="font-medium text-red-600">Không tìm thấy lịch hẹn hoặc đã bị xóa.</p>
        <Button variant="outline" onClick={() => navigate('/lich-xem-phong')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  /**
   * Cập nhật trạng thái lịch hẹn (Xác nhận, Hủy, Hoàn tất)
   */
  const handleSetStatus = async (status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ status })
      toast.success('Đã cập nhật trạng thái lịch hẹn thành công')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const property = data.room.property

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/lich-xem-phong')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách lịch hẹn
      </Button>

      {/* Main Status Header Card */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Lịch hẹn #{data.id}</h1>
            <StatusBadge status={data.status} statusMap={APPOINTMENT_STATUS_MAP} fallbackLabel={data.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Khách gửi lịch hẹn xem phòng lúc {formatDateTime(data.createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {data.status === 'PENDING' && (
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              onClick={() => handleSetStatus('CONFIRMED')}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Xác nhận lịch
            </Button>
          )}
          {['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(data.status) && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleSetStatus('CANCELED')}
              disabled={updateStatus.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Hủy lịch hẹn
            </Button>
          )}
          {data.status === 'CONFIRMED' && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              onClick={() => handleSetStatus('COMPLETED')}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Hoàn tất buổi xem phòng
            </Button>
          )}
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Thông tin cuộc hẹn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thời gian xem phòng</span>
              <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                {formatDateTime(data.scheduledAt)}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phòng đăng ký xem</span>
              <p className="mt-1 font-semibold text-slate-800 flex items-center gap-2">
                <Home className="h-4 w-4 text-slate-400" />
                {data.room.title} ({data.room.roomCode})
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ghi chú từ khách</span>
              <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                {data.note || 'Khách không để lại ghi chú đặc biệt.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" /> Khách thuê & Nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng</span>
              <p className="mt-1 font-bold text-slate-900 text-base">{data.renter.fullName}</p>
              <div className="mt-1.5 space-y-1 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{data.renter.phone || 'Chưa cập nhật số điện thoại'}</span>
                </p>
                {data.renter.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{data.renter.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên phụ trách dẫn xem</span>
              <p className="mt-1 font-semibold text-slate-800">
                {data.assignedStaff?.fullName ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {data.assignedStaff.fullName}
                  </span>
                ) : (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-sm">
                    Chưa phân công nhân viên
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Location Card */}
      {property && (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-500" /> Điểm hẹn & Địa chỉ tòa nhà
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="font-semibold text-slate-900 text-base">{property.name}</p>
            <p className="mt-1 text-sm text-slate-600">
              {property.addressDetail}, {property.ward}, {property.district}, {property.province}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
