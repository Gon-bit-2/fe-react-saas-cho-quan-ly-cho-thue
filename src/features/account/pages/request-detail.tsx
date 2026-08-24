import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, ClipboardList, AlertCircle, Building2, User, Calendar, MapPin, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import type { RentalRequest } from '@/types/rental-request'
import { StatusBadge } from '@/components/ui/status-badge'
import { RENTAL_REQUEST_STATUS_MAP } from '@/shared/constants/status-config'
import { format } from 'date-fns'

export default function RequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: request, isLoading, isError } = useQuery<RentalRequest>({
    queryKey: ['my-rental-request-detail', id],
    queryFn: () => apiClient.get(`/rental-requests/me/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const cancelRequest = useMutation({
    mutationFn: (requestId: number) => apiClient.patch(`/rental-requests/me/${requestId}/cancel`, {}),
    onSuccess: () => {
      // Refresh after cancel
      navigate('/tai-khoan/yeu-cau-thue')
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/yeu-cau-thue')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
              Chi tiết yêu cầu thuê
            </h1>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
          Đang tải dữ liệu...
        </div>
      </div>
    )
  }

  if (isError || !request) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/yeu-cau-thue')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          <AlertCircle className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p>Không thể tải thông tin yêu cầu thuê. Yêu cầu có thể không tồn tại hoặc bạn không có quyền truy cập.</p>
        </div>
      </div>
    )
  }

  const canCancel = ['PENDING', 'NEED_MORE_INFO'].includes(request.status)

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return 'Không có'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/yeu-cau-thue')} className="shrink-0 bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Yêu cầu thuê #{request.id}
              </h1>
              <StatusBadge status={request.status} statusMap={RENTAL_REQUEST_STATUS_MAP} fallbackLabel={request.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Ngày gửi: {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>

        {canCancel && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn hủy yêu cầu này?')) {
                  cancelRequest.mutate(request.id)
                }
              }}
              disabled={cancelRequest.isPending}
            >
              Hủy yêu cầu
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Request & Renter Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-800">Nội dung yêu cầu</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Lời nhắn</p>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[80px]">
                  {request.message || <span className="text-slate-400 italic">Không có lời nhắn</span>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Ngày dự kiến chuyển vào
                </p>
                <p className="text-slate-900 font-medium">
                  {request.expectedStartDate ? format(new Date(request.expectedStartDate), 'dd/MM/yyyy') : 'Chưa xác định'}
                </p>
              </div>
            </div>
          </div>

          {request.renter && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-800">Thông tin cá nhân</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    {request.renter.avatarUrl ? (
                      <img src={request.renter.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-indigo-50">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{request.renter.fullName || 'Người dùng'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Số điện thoại</p>
                    <p className="font-medium text-slate-900">{request.renter.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{request.renter.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Room Info */}
        <div className="space-y-6">
          {request.room && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-slate-800">Thông tin phòng</h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{request.room.title || `Phòng ${request.room.roomCode || request.room.id}`}</h3>
                  {request.room.property && (
                    <p className="text-slate-600 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {request.room.property.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Giá thuê</p>
                    <p className="font-semibold text-blue-600 text-lg">
                      {/* @ts-expect-error basePrice exists on room but might not be in the partial type */}
                      {formatCurrency(request.room.basePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Tiền cọc</p>
                    <p className="font-semibold text-slate-900 text-lg">
                      {/* @ts-expect-error depositAmount exists on room but might not be in the partial type */}
                      {formatCurrency(request.room.depositAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Diện tích</p>
                    <p className="font-medium text-slate-800">
                      {/* @ts-expect-error area exists on room but might not be in the partial type */}
                      {request.room.area ? `${request.room.area} m²` : 'Không có thông tin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Sức chứa tối đa</p>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      {/* @ts-expect-error maxRenters exists on room but might not be in the partial type */}
                      {request.room.maxRenters ? `${request.room.maxRenters} người` : 'Không giới hạn'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-start text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => navigate(`/phong/${request.room?.id}`)}>
                    <Tag className="mr-2 h-4 w-4" />
                    Xem bài đăng phòng này
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
