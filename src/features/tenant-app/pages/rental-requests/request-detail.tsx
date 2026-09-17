import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useRentalRequest, useUpdateRentalRequestDecision } from '@/shared/api/rental-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { ArrowLeft, Calendar, Clock, Check, X, MessageSquare, FileText, Briefcase, Home, Loader2, Phone, Mail, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RENTAL_REQUEST_STATUS_MAP } from '@/shared/constants/status-config'
import { formatCurrency, formatDate, formatDateTime } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Trang xem chi tiết yêu cầu thuê phòng từ khách hàng
 * Hiển thị hồ sơ khách thuê, phòng đăng ký, các mốc thời gian và hành động phê duyệt/từ chối
 */
export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: request, isLoading } = useRentalRequest(Number(id))
  const { mutateAsync: updateDecision, isPending: isUpdating } = useUpdateRentalRequestDecision()

  const [confirmAction, setConfirmAction] = useState<'APPROVED' | 'REJECTED' | null>(null)

  /**
   * Xử lý phê duyệt hoặc từ chối yêu cầu thuê phòng
   */
  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    try {
      await updateDecision({ id: Number(id), status: action })
      toast.success(`Đã xử lý yêu cầu: ${action === 'APPROVED' ? 'Chấp thuận' : 'Từ chối'}`)
      setConfirmAction(null)
      setTimeout(() => {
        navigate('/yeu-cau-thue')
      }, 800)
    } catch {
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="font-medium text-slate-500">Đang tải thông tin yêu cầu...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="font-medium text-slate-500">Không tìm thấy yêu cầu thuê này.</p>
        <Button variant="outline" onClick={() => navigate('/yeu-cau-thue')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 pb-12 duration-300">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-900"
        onClick={() => navigate('/yeu-cau-thue')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách yêu cầu
      </Button>

      {/* Top Banner Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Yêu cầu thuê #REQ-{request.id}</h1>
            <StatusBadge
              status={request.status}
              statusMap={RENTAL_REQUEST_STATUS_MAP}
              fallbackLabel={request.status}
              className="px-3 py-1 text-xs font-bold tracking-wider uppercase"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 tabular-nums">
            <Clock className="h-4 w-4 text-slate-400" />
            Thời gian gửi: {formatDateTime(request.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {(request.status === 'PENDING' || request.status === 'NEED_MORE_INFO') && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => setConfirmAction('REJECTED')}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" /> Từ chối
              </Button>
              <Button
                className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                onClick={() => setConfirmAction('APPROVED')}
                disabled={isUpdating}
              >
                <Check className="mr-2 h-4 w-4" /> Chấp thuận yêu cầu
              </Button>
            </>
          )}
          {request.status === 'APPROVED' && (
            <Button
              className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
              onClick={() =>
                navigate(
                  `/hop-dong/tao?renterId=${request.renterId}&roomId=${request.roomId}&rentalRequestId=${request.id}`,
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" /> Tiến hành tạo hợp đồng
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Hồ sơ khách & Thông tin phòng */}
        <div className="space-y-6 lg:col-span-2">
          {/* Renter Profile Card */}
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardContent className="relative px-6 pt-0 pb-6">
              <div className="-mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-sm">
                  <AvatarImage src={request.renter?.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-xl font-bold text-slate-700">
                    {request.renter?.fullName?.charAt(0) || 'K'}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {request.renter?.fullName || `Khách thuê #${request.renterId}`}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Briefcase className="h-4 w-4 text-slate-400" />{' '}
                    {request.renter?.renterProfile?.occupation || 'Nghề nghiệp: Chưa cập nhật'}
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Số điện thoại
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-900 tabular-nums">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {request.renter?.phone || 'Chưa cập nhật'}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Email liên hệ</div>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {request.renter?.email || 'Chưa cập nhật'}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Ngày sinh</div>
                  <div className="font-medium text-slate-900 tabular-nums">
                    {request.renter?.renterProfile?.dateOfBirth
                      ? formatDate(request.renter.renterProfile.dateOfBirth)
                      : 'Chưa cập nhật'}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Địa chỉ thường trú</div>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{request.renter?.renterProfile?.permanentAddress || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Info Card */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <Home className="h-5 w-5 text-blue-600" /> Thông tin phòng đăng ký thuê
              </CardTitle>
              {request.roomId && (
                <Button
                  variant="link"
                  className="h-auto p-0 text-blue-600 text-sm font-medium"
                  onClick={() => navigate(`/quan-ly-phong/${request.roomId}`)}
                >
                  Xem chi tiết phòng
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {request.room?.title || `Phòng ${request.roomId}`}
                    {request.room?.property?.name && ` • ${request.room.property.name}`}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Diện tích: <span className="font-semibold text-slate-700">{request.room?.area ? `${request.room.area}m²` : '—'}</span> •
                    Sức chứa: <span className="font-semibold text-slate-700">Tối đa {request.room?.maxOccupants || 0} người</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div>
                    <div className="mb-1 text-xs text-slate-500 uppercase tracking-wider font-medium">Giá thuê tháng</div>
                    <div className="font-bold text-emerald-600 text-base tabular-nums">
                      {formatCurrency(request.room?.basePrice || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-slate-500 uppercase tracking-wider font-medium">Tiền cọc dự kiến</div>
                    <div className="font-semibold text-slate-800 text-base tabular-nums">
                      {formatCurrency(request.room?.depositAmount || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-slate-500 uppercase tracking-wider font-medium">Điện / Nước</div>
                    <div className="font-semibold text-slate-800 text-sm tabular-nums">
                      {formatCurrency(request.room?.electricityPrice || 0)}/kWh • {formatCurrency(request.room?.waterPrice || 0)}/khối
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="mb-1 text-xs text-slate-500 font-medium">Ngày bắt đầu thuê dự kiến</div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 tabular-nums">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {request.expectedStartDate ? formatDate(request.expectedStartDate) : 'Chưa xác định'}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-slate-500 font-medium">Trạng thái hiện tại của phòng</div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {request.room?.status === 'AVAILABLE' ? (
                        <span className="text-emerald-600">Đang trống (Sẵn sàng vào)</span>
                      ) : (
                        <span className="text-slate-600">{request.room?.status || 'Chưa xác định'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Lời nhắn & Tiến trình */}
        <div className="space-y-6">
          {/* Message from guest */}
          <Card className="rounded-xl border-blue-100 bg-blue-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <MessageSquare className="h-4 w-4 text-blue-600" /> Lời nhắn gửi từ khách
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-700 italic border border-blue-100 shadow-2xs">
                "{request.message || 'Khách không để lại lời nhắn nào.'}"
              </div>
            </CardContent>
          </Card>

          {/* Request Timeline */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <Clock className="h-4 w-4 text-blue-600" /> Tiến trình xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 border-l-2 border-slate-200 pl-4 ml-2">
                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Gửi yêu cầu thuê</h4>
                    <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Hồ sơ khách thuê</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {request.renter?.renterProfile?.verificationStatus === 'VERIFIED'
                        ? 'Đã xác thực CCCD'
                        : 'Hồ sơ thông tin cơ bản'}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ring-white ${
                      request.status === 'APPROVED'
                        ? 'bg-emerald-500'
                        : request.status === 'REJECTED'
                          ? 'bg-red-500'
                          : 'bg-blue-600 animate-pulse'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {request.status === 'APPROVED'
                        ? 'Chủ trọ đã chấp thuận'
                        : request.status === 'REJECTED'
                          ? 'Yêu cầu bị từ chối'
                          : 'Chờ chủ trọ thẩm định'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {request.status === 'APPROVED'
                        ? 'Sẵn sàng soạn hợp đồng cho thuê'
                        : request.status === 'REJECTED'
                          ? 'Đã phản hồi tới khách hàng'
                          : 'Đang xem xét duyệt hồ sơ'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'APPROVED' ? 'Xác nhận chấp thuận yêu cầu thuê' : 'Xác nhận từ chối yêu cầu'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'APPROVED'
                ? `Bạn có chắc chắn muốn chấp thuận yêu cầu thuê của khách hàng ${request.renter?.fullName || ''}? Sau khi chấp thuận, bạn có thể tạo hợp đồng trực tiếp.`
                : `Bạn có chắc chắn muốn từ chối yêu cầu thuê này? Hành động này sẽ thông báo đến khách hàng.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isUpdating}>
              Hủy
            </Button>
            <Button
              variant={confirmAction === 'APPROVED' ? 'default' : 'destructive'}
              className={confirmAction === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => confirmAction && handleAction(confirmAction)}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
