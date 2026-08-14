import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, Calendar, Clock, MapPin, Phone, 
  AlertTriangle, User, Check, X, Repeat, CheckCircle2
} from 'lucide-react'

// Mock data
const mockSchedule = {
  id: 'LX-20231015-01',
  createdAt: '2 ngày trước',
  status: 'Chờ Xác Nhận',
  conflict: {
    hasConflict: true,
    message: 'Nhân viên Minh Landlord có một lịch hẹn khác (Phòng 203) lúc 14:30, chỉ cách lịch hẹn này 30 phút. Vui lòng cân nhắc dời lịch để đảm bảo thời gian di chuyển và tư vấn.'
  },
  room: {
    name: 'Phòng 305',
    type: 'Tòa nhà A - Studio 35m2',
    price: '4.500.000 VNĐ/tháng',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150&h=150'
  },
  time: {
    date: 'Thứ 5, 15/10/2023',
    time: '14:00 - 14:30'
  },
  customer: {
    name: 'Nguyễn Trần Thảo Vy',
    phone: '0901 234 567',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
  },
  staff: {
    name: 'Minh Landlord',
    role: 'Quản lý khu vực',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d'
  },
  note: 'Tôi muốn xem kỹ phần bếp và nhà vệ sinh. Có thể dắt theo bạn cùng phòng không?',
  location: {
    address: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    mapImage: 'https://developers.google.com/static/maps/documentation/maps-static/images/quickstart-center.png'
  },
  timeline: [
    {
      id: 1,
      title: 'Khách hàng yêu cầu dời lịch',
      time: '13/10/2023 - 11:30 AM',
      note: 'Lý do: "Bận công việc đột xuất sáng 14/10"',
      active: true,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Lịch dự kiến cũ',
      time: '14/10/2023 - 10:00 AM',
      note: '',
      active: false,
      color: 'bg-slate-300'
    },
    {
      id: 3,
      title: 'Khách hàng tạo yêu cầu',
      time: '13/10/2023 - 09:15 AM',
      note: 'Nguồn: Đặt lịch qua Website',
      active: false,
      color: 'bg-slate-300'
    }
  ]
}

export default function Component() {
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = useParams()

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -ml-3" onClick={() => navigate('/quan-ly-nha-tro/lich-xem-phong')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chi tiết lịch hẹn #{mockSchedule.id}</h1>
            <p className="text-slate-500 text-sm">Được tạo {mockSchedule.createdAt}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="bg-white text-slate-700">
            <X className="w-4 h-4 mr-2 text-slate-400" /> Từ chối / Hủy
          </Button>
          <Button variant="outline" className="bg-white text-slate-700">
            <Repeat className="w-4 h-4 mr-2 text-slate-400" /> Dời lịch
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Xác nhận lịch
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
            <Check className="w-4 h-4 mr-2" /> Hoàn tất
          </Button>
        </div>
      </div>

      {mockSchedule.conflict.hasConflict && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 text-sm mb-1">Cảnh báo trùng lịch trình</h4>
            <p className="text-sm text-red-700/90">{mockSchedule.conflict.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin lịch hẹn */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Thông tin lịch hẹn</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Phòng quan tâm */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Phòng quan tâm</h3>
                <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={mockSchedule.room.image} alt="Room" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-blue-600 text-lg">{mockSchedule.room.name}</div>
                    <div className="text-sm text-slate-600 mb-1">{mockSchedule.room.type}</div>
                    <div className="text-sm font-medium text-emerald-600">{mockSchedule.room.price}</div>
                  </div>
                </div>
              </div>
              
              {/* Thời gian dự kiến */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thời gian dự kiến</h3>
                <div className="flex flex-col justify-center h-[88px] px-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {mockSchedule.time.date}
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-lg">
                    <Clock className="w-4 h-4" />
                    {mockSchedule.time.time}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Người xem phòng */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Người xem phòng</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockSchedule.customer.avatar} />
                    <AvatarFallback>KH</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">{mockSchedule.customer.name}</div>
                    <div className="flex items-center text-sm text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 mr-1" /> {mockSchedule.customer.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhân viên phụ trách */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nhân viên phụ trách</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={mockSchedule.staff.avatar} />
                      <AvatarFallback>NV</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">{mockSchedule.staff.name}</div>
                      <div className="flex items-center text-sm text-slate-500 mt-0.5">
                        <User className="w-3 h-3 mr-1" /> {mockSchedule.staff.role}
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-slate-100 text-slate-700 h-8 text-xs">
                    <Repeat className="w-3 h-3 mr-1.5" /> Đổi nhân viên
                  </Button>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
               <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm italic border border-slate-100">
                  <span className="text-slate-400 font-medium not-italic block mb-1 text-xs">Ghi chú từ khách:</span>
                  "{mockSchedule.note}"
               </div>
            </div>
          </div>

          {/* Vị trí điểm hẹn */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Vị trí điểm hẹn</h2>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-64">
              <img src={mockSchedule.location.mapImage} alt="Map" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 border border-slate-200">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{mockSchedule.location.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trạng thái hiện tại */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6 text-left">Trạng thái hiện tại</h3>
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-orange-600 mb-2">{mockSchedule.status}</h2>
            <p className="text-slate-500 text-sm">Khách hàng đã gửi yêu cầu. Vui lòng xác nhận để giữ chỗ.</p>
          </div>

          {/* Lịch sử hoạt động */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Lịch sử hoạt động</h3>
            <div className="space-y-6 relative pl-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {mockSchedule.timeline.map((item) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div className={`w-3 h-3 mt-1.5 rounded-full ring-4 ring-white z-10 shrink-0 ${item.active ? item.color : 'bg-slate-300'}`} />
                  <div>
                    <div className={`font-semibold text-sm ${item.active ? 'text-slate-900' : 'text-slate-500'}`}>{item.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.time}</div>
                    {item.note && (
                      <div className="mt-2 bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100">
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Next step placeholder */}
              <div className="relative flex items-start gap-4 opacity-50">
                <div className="w-3 h-3 mt-1.5 rounded-full border-2 border-slate-300 ring-4 ring-white z-10 shrink-0 bg-white" />
                <div>
                  <div className="font-semibold text-sm text-slate-400">Chờ xác nhận lịch mới</div>
                  <div className="text-xs text-slate-400 mt-1">--/--/----</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
