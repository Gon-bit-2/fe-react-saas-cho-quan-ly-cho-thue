import { useParams, useNavigate } from 'react-router'
import { useRentalRequest, useUpdateRentalRequestDecision } from '@/shared/api/rental-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { ArrowLeft, Calendar, Clock, Check, X, MessageSquare, FileText, Briefcase, Home } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RENTAL_REQUEST_STATUS_MAP } from '@/shared/constants/status-config'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: request, isLoading } = useRentalRequest(Number(id))
  const { mutateAsync: updateDecision } = useUpdateRentalRequestDecision()

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    try {
      await updateDecision({ id: Number(id), status: action })
      toast.success(`Đã xử lý yêu cầu: ${action === 'APPROVED' ? 'Chấp thuận' : 'Từ chối'}`)
      setTimeout(() => {
        navigate('/yeu-cau-thue')
      }, 1000)
    } catch {
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu.')
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500">Đang tải thông tin...</div>
  }

  if (!request) {
    return <div className="py-12 text-center text-slate-500">Không tìm thấy yêu cầu thuê.</div>
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 pb-12 duration-500">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-900"
        onClick={() => navigate('/yeu-cau-thue')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      {/* Header */}
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
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4" />
            Gửi lúc{' '}
            {new Date(request.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            , {new Date(request.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleAction('REJECTED')}
          >
            <X className="mr-2 h-4 w-4" /> Từ chối
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
            <FileText className="mr-2 h-4 w-4" /> Yêu cầu bổ sung
          </Button>
          <Button
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            onClick={() => handleAction('APPROVED')}
          >
            <Check className="mr-2 h-4 w-4" /> Duyệt yêu cầu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Renter Profile Card */}
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-100 to-indigo-100"></div>
            <CardContent className="relative px-6 pt-0 pb-6">
              <div className="-mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <Avatar className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-sm">
                  <AvatarImage src={request.renter?.avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-2xl font-bold text-slate-600">
                    {request.renter?.fullName?.charAt(0) || 'K'}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {request.renter?.fullName || `Khách thuê #${request.renterId}`}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Briefcase className="h-4 w-4" /> Nhân viên văn phòng - Công ty TNHH ABC
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Số điện thoại
                  </div>
                  <div className="font-medium text-slate-900">{request.renter?.phone || '0912 345 678'}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Email</div>
                  <div className="font-medium text-slate-900">{request.renter?.email || 'mai.nguyen@email.com'}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Ngày sinh</div>
                  <div className="font-medium text-slate-900">15/08/1995</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Quê quán</div>
                  <div className="font-medium text-slate-900">Thanh Hóa</div>
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Tài liệu đính kèm (CCCD)
                </div>
                <div className="flex gap-4">
                  <div className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-100 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-100 text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-500">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Info Card */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Home className="h-5 w-5 text-blue-600" /> Thông tin phòng đăng ký
              </CardTitle>
              <Button variant="link" className="h-auto p-0 text-blue-600">
                Xem chi tiết phòng
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 md:w-1/3">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"
                    alt="Room thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Phòng {request.roomId} - Tòa A</h3>
                    <p className="text-sm text-slate-500">Loại: Studio • 35m² • Đầy đủ nội thất</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <div className="mb-1 text-xs text-slate-500">Giá thuê (tháng)</div>
                      <div className="font-semibold text-slate-900">4,500,000 ₫</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-slate-500">Tiền cọc (dự kiến)</div>
                      <div className="font-semibold text-slate-900">4,500,000 ₫</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-slate-500">Phí dịch vụ ~</div>
                      <div className="font-semibold text-slate-900">300k/tháng</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-1 text-xs text-slate-500">Ngày bắt đầu dự kiến</div>
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {request.expectedStartDate
                          ? new Date(request.expectedStartDate).toLocaleDateString('vi-VN')
                          : '01/11/2023'}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-slate-500">Thời hạn thuê</div>
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <Clock className="h-4 w-4 text-slate-400" />
                        12 tháng
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Message from guest */}
          <div className="rounded-xl bg-blue-600 p-6 text-white shadow-md">
            <div className="mb-4 flex items-center gap-2 font-semibold text-blue-50">
              <MessageSquare className="h-5 w-5" /> Lời nhắn từ khách
            </div>
            <div className="rounded-lg bg-blue-700/50 p-4 text-sm leading-relaxed text-blue-50 italic shadow-inner">
              "
              {request.message ||
                'Chào anh/chị, em thấy phòng này phù hợp với nhu cầu. Em có nuôi một bé mèo nhỏ (đã triệt sản và ngoan), không biết bên mình có cho phép không ạ? Nếu được em muốn chuyển vào đầu tháng sau luôn. Cảm ơn anh/chị.'}
              "
            </div>
          </div>

          {/* Timeline */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Clock className="h-5 w-5 text-blue-600" /> Tiến trình yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-6 pl-6 before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[-31px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Khách gửi yêu cầu</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(request.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[-31px] flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Hệ thống xác thực CCCD hợp lệ</h4>
                    <p className="mt-1 text-xs text-slate-500">14:32, 24/10/2023</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="absolute left-[-31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-100 ring-4 ring-white">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-700">Chờ Landlord duyệt</h4>
                    <p className="mt-1 text-xs text-blue-500/80">Đang xử lý</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 opacity-50">
                  <div className="absolute left-[-31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-100 ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-600">Ký hợp đồng & Đặt cọc</h4>
                    <p className="mt-1 text-xs text-slate-400">Chưa bắt đầu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
