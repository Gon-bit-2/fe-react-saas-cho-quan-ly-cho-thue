import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, XCircle, FileText, Check, Phone, ArrowRight } from 'lucide-react'
import type { AppointmentStatus } from '@/types/viewing-schedule'
import { toast } from 'sonner'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data for UI demonstration
  const schedule = {
    id: Number(id),
    status: 'PENDING' as AppointmentStatus,
    scheduledAt: '2026-08-10T14:30:00Z',
    landlordNote: 'Nhớ mang theo form cọc.',
    createdAt: '2026-08-05T10:00:00Z',
    room: {
      id: 201,
      code: 'P.201',
      price: 3500000,
      property: 'Tòa nhà Cầu Giấy',
      address: 'Ngõ 123 Cầu Giấy, HN'
    },
    renter: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      email: 'nguyenvana@example.com',
    }
  }

  const handleAction = (action: string) => {
    toast.success(`Đã cập nhật trạng thái lịch hẹn: ${action}`)
    setTimeout(() => {
      navigate('/app/quan-ly-nha-tro/lich-xem-phong')
    }, 1000)
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 shadow-sm text-sm"><Clock className="w-4 h-4 mr-2" /> Chờ xác nhận</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 shadow-sm text-sm"><CheckCircle2 className="w-4 h-4 mr-2" /> Đã xác nhận</Badge>
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 py-1 shadow-sm text-sm"><CheckCircle2 className="w-4 h-4 mr-2" /> Đã xem xong</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Profile */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <Button variant="ghost" size="sm" className="mb-4 text-slate-500 hover:text-slate-900 -ml-2" onClick={() => navigate('/app/quan-ly-nha-tro/lich-xem-phong')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Lịch hẹn #{schedule.id}
                {getStatusBadge(schedule.status)}
              </h1>
              <p className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                Tạo lúc: {new Date(schedule.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            
            <div className="flex gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction('CANCELED')}>
                <XCircle className="w-4 h-4 mr-2" /> Hủy hẹn
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200" onClick={() => handleAction('CONFIRMED')}>
                <Check className="w-4 h-4 mr-2" /> Xác nhận lịch
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
                <Calendar className="w-5 h-5 text-indigo-500" />
                Thời gian cuộc hẹn
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-white">
              <div className="flex items-center gap-6">
                <div className="bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center p-4 rounded-xl border border-indigo-100 w-24">
                  <span className="text-sm font-semibold uppercase">{new Date(schedule.scheduledAt).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                  <span className="text-3xl font-bold">{new Date(schedule.scheduledAt).getDate()}</span>
                  <span className="text-xs">Th {new Date(schedule.scheduledAt).getMonth() + 1}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 font-medium">Giờ hẹn</div>
                  <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    {new Date(schedule.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-medium mb-2">Ghi chú nội bộ (Landlord Note)</div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 flex gap-3">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <p>{schedule.landlordNote || 'Không có ghi chú.'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-emerald-50 border-emerald-100">
             <div className="p-6 flex items-center justify-between">
                <div>
                   <h3 className="font-semibold text-emerald-800 text-lg mb-1">Khách đã xem xong?</h3>
                   <p className="text-emerald-700/80 text-sm">Chuyển trạng thái sang đã xem để lưu trữ tiến độ.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 text-white" onClick={() => handleAction('COMPLETED')}>
                   <CheckCircle2 className="w-4 h-4 mr-2" /> Đánh dấu đã xem
                </Button>
             </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Thông tin liên lạc</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              <div className="font-bold text-slate-900 text-lg">{schedule.renter.name}</div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-3 text-slate-400" />
                  {schedule.renter.phone}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                <Phone className="w-4 h-4 mr-2" /> Gọi điện ngay
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800">Thông tin phòng</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Mã phòng</span>
                  <Badge variant="outline" className="font-bold text-slate-700">{schedule.room.code}</Badge>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-slate-500 text-sm block mb-1">Cơ sở / Địa chỉ</span>
                  <div className="font-medium text-slate-900">{schedule.room.property}</div>
                  <div className="text-xs text-slate-500 mt-1">{schedule.room.address}</div>
                </div>
              </div>
              <Button variant="ghost" className="w-full text-indigo-600 justify-between" onClick={() => navigate(`/app/quan-ly-phong/${schedule.room.id}/chi-tiet`)}>
                Xem chi tiết phòng <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
