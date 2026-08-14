import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Phone, MessageSquare, FileText, Wrench, Calendar, CheckCircle2, ChevronRight, MoreHorizontal, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock Data
const mockRenter = {
  id: 'RES8821',
  fullName: 'Nguyễn Văn A',
  status: 'Đang thuê',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  personalInfo: {
    fullName: 'Nguyễn Văn A',
    dob: '15/05/1992',
    phone: '090 **** 567',
    email: 'a.nguyen****@gmail.com',
    identity: '07909200****'
  },
  currentContract: {
    room: 'Căn hộ B-12.05',
    building: 'Chung cư Vinhomes Central Park',
    status: 'Hiệu lực',
    price: '15.000.000 VNĐ / tháng',
    duration: '01/01/2024 - 01/01/2025',
    file: 'Hop_dong_B1205.pdf'
  },
  roommates: [
    { name: 'Trần Thị B', relation: 'Vợ', id: 'RES8822', avatar: 'https://i.pravatar.cc/150?u=b042581f4e29026024d' },
    { name: 'Nguyễn Văn C', relation: 'Con', id: 'RES8823', avatar: 'https://i.pravatar.cc/150?u=c042581f4e29026024d' }
  ],
  history: [
    { room: 'Phòng A-05.10', duration: '01/01/2022 - 31/12/2023', status: 'Đã kết thúc' },
    { room: 'Phòng C-22.01', duration: '15/06/2020 - 31/12/2021', status: 'Đã kết thúc' }
  ],
  timeline: [
    { type: 'maintenance', title: 'Sửa máy lạnh', time: '14:00 • Hôm nay', desc: 'Đang thực hiện - Kỹ thuật viên: Trần Hoàng Nam', color: 'bg-blue-600', icon: Wrench },
    { type: 'appointment', title: 'Lịch hẹn ký phụ lục', time: '09:30 • 25/10/2023', desc: 'Địa điểm: Văn phòng BQL Tòa B', color: 'bg-slate-200', icon: Calendar, iconColor: 'text-slate-500' },
    { type: 'payment', title: 'Thanh toán tiền điện T9', time: 'Hoàn tất • 05/10/2023', desc: 'Mã giao dịch: #INV-9921203', color: 'bg-emerald-100', icon: CheckCircle2, iconColor: 'text-emerald-600' }
  ]
}

export default function Component() {
  const navigate = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = useParams()

  return (
    <div className="max-w-[800px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 -ml-3" onClick={() => navigate('/nguoi-thue')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Chi tiết người thuê
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" className="bg-slate-100 border-none text-slate-600">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="bg-slate-100 border-none text-slate-600">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
            <AvatarImage src={mockRenter.avatar} />
            <AvatarFallback>NV</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{mockRenter.fullName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <div className="flex items-center text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                {mockRenter.status}
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600 font-medium">Mã cư dân: {mockRenter.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="bg-slate-100 text-slate-700 border-none px-6">
            Gọi điện
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-sm">
            Gửi tin nhắn
          </Button>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900">Thông tin cá nhân</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
            <span className="text-slate-500 text-sm">Họ và tên</span>
            <span className="font-medium text-slate-900 text-sm">{mockRenter.personalInfo.fullName}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
            <span className="text-slate-500 text-sm">Ngày sinh</span>
            <span className="font-medium text-slate-900 text-sm">{mockRenter.personalInfo.dob}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
            <span className="text-slate-500 text-sm">Số điện thoại</span>
            <span className="font-medium text-slate-900 text-sm">{mockRenter.personalInfo.phone}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
            <span className="text-slate-500 text-sm">Email</span>
            <span className="font-medium text-slate-900 text-sm">{mockRenter.personalInfo.email}</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4">
            <span className="text-slate-500 text-sm">Số CMND/CCCD</span>
            <span className="font-medium text-slate-900 text-sm">{mockRenter.personalInfo.identity}</span>
          </div>
        </div>
      </section>

      {/* Hợp đồng hiện tại */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900">Hợp đồng hiện tại</h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-blue-600 font-bold text-lg">{mockRenter.currentContract.room}</h3>
              <p className="text-slate-500 text-sm mt-0.5">{mockRenter.currentContract.building}</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-medium px-3">
              {mockRenter.currentContract.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-xs mb-1">Giá thuê</div>
              <div className="font-bold text-slate-900 text-sm">{mockRenter.currentContract.price}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-xs mb-1">Thời hạn</div>
              <div className="font-bold text-slate-900 text-sm">{mockRenter.currentContract.duration}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 text-sm">
              <FileText className="w-4 h-4 text-slate-400" />
              {mockRenter.currentContract.file}
            </div>
            <Button variant="link" className="text-blue-600 font-medium h-auto p-0">
              Xem chi tiết
            </Button>
          </div>
        </div>
      </section>

      {/* Thành viên cùng phòng */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900">Thành viên cùng phòng ({mockRenter.roommates.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockRenter.roommates.map((rm) => (
            <div key={rm.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={rm.avatar} />
                  <AvatarFallback>{rm.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{rm.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{rm.relation} - {rm.id}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
            </div>
          ))}
        </div>
      </section>

      {/* Lịch sử thuê */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900">Lịch sử thuê</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {mockRenter.history.map((h, i) => (
            <div key={i} className={`flex justify-between items-center px-6 py-4 hover:bg-slate-50 cursor-pointer ${i !== mockRenter.history.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm mb-1">{h.room}</div>
                  <div className="text-xs text-slate-500">{h.duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal border-none">{h.status}</Badge>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Yêu cầu & Lịch hẹn */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900">Yêu cầu & Lịch hẹn</h2>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">Sửa máy lạnh</h3>
                  <div className="text-blue-600 text-xs font-medium text-right">14:00 • Hôm nay</div>
                </div>
                <p className="text-slate-500 text-xs">Đang thực hiện - Kỹ thuật viên: Trần Hoàng Nam</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">Lịch hẹn ký phụ lục</h3>
                  <div className="text-slate-500 text-xs font-medium text-right">09:30 • 25/10/2023</div>
                </div>
                <p className="text-slate-500 text-xs">Địa điểm: Văn phòng BQL Tòa B</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">Thanh toán tiền điện T9</h3>
                  <div className="text-emerald-600 text-xs font-medium text-right">Hoàn tất • 05/10/2023</div>
                </div>
                <p className="text-slate-500 text-xs">Mã giao dịch: #INV-9921203</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
