import { useParams, useNavigate } from 'react-router'
import { useRentalRequest, useUpdateRentalRequestDecision } from '@/shared/api/rental-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Clock, CheckCircle2, XCircle, Info, MessagesSquare, Check } from 'lucide-react'
import type { RentalRequestStatus } from '@/types/rental-request'
import { toast } from 'sonner'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: request, isLoading } = useRentalRequest(Number(id))
  const { mutateAsync: updateDecision } = useUpdateRentalRequestDecision()

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    try {
      await updateDecision({ id: Number(id), status: action })
      toast.success(`Đã xử lý yêu cầu: ${action}`)
      setTimeout(() => {
        navigate('/quan-ly-nha-tro/yeu-cau-thue')
      }, 1000)
    } catch {
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu.')
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Đang tải thông tin...</div>
  }

  if (!request) {
    return <div className="text-center py-12 text-slate-500">Không tìm thấy yêu cầu thuê.</div>
  }

  const getStatusBadge = (status: RentalRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 shadow-sm text-sm"><Clock className="w-4 h-4 mr-2" /> Chờ xét duyệt</Badge>
      case 'APPROVED':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 shadow-sm text-sm"><CheckCircle2 className="w-4 h-4 mr-2" /> Đã phê duyệt</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Profile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <Button variant="ghost" size="sm" className="mb-4 text-slate-500 hover:text-slate-900 -ml-2" onClick={() => navigate('/quan-ly-nha-tro/yeu-cau-thue')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Yêu cầu thuê #{request.id}
                {getStatusBadge(request.status)}
              </h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 
                Ngày gửi: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            
            <div className="flex gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction('REJECTED')}>
                <XCircle className="w-4 h-4 mr-2" /> Từ chối
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200" onClick={() => handleAction('APPROVED')}>
                <Check className="w-4 h-4 mr-2" /> Phê duyệt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                <MessagesSquare className="w-5 h-5 text-indigo-500" />
                Nội dung yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                <div className="text-sm text-indigo-900/60 font-medium mb-1">Ngày mong muốn chuyển vào</div>
                <div className="text-indigo-900 font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {request.expectedStartDate ? new Date(request.expectedStartDate).toLocaleDateString('vi-VN') : 'Không rõ'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-slate-500 font-medium mb-2">Lời nhắn từ khách thuê</div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic">
                  "{request.message}"
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Khách thuê</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Renter ID: {request.renterId}</div>
                  <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    Khách hàng
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-3 text-slate-400" />
                  -
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-3 text-slate-400" />
                  -
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Phòng quan tâm</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Room ID</span>
                  <span className="font-semibold text-slate-900">{request.roomId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Mã phòng</span>
                  <Badge variant="outline" className="font-bold text-indigo-700 bg-indigo-50 border-indigo-200">{request.roomId}</Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-slate-500 text-sm">Property ID</span>
                  <span className="font-bold text-emerald-600">{request.propertyId}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
