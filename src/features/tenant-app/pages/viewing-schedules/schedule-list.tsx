import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Plus,
  List,
  CalendarDays,
  MoreVertical,
  Filter,
  AlertTriangle,
  Building2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Fake data for now
const mockData = [
  {
    id: 1,
    customer: { name: 'Nguyễn Văn A', phone: '0901 234 567', initials: 'NA' },
    room: { name: 'P.101', building: 'Tòa A' },
    time: { timeRange: '14:00 - 14:30', date: 'Hôm nay, 24/10' },
    isConflict: true,
    staff: { name: 'Lan Sales', avatar: 'https://i.pravatar.cc/150?u=1' },
    status: 'Đã xác nhận',
  },
  {
    id: 2,
    customer: { name: 'Trần Thị B', phone: '0988 765 432', initials: 'TB' },
    room: { name: 'P.101', building: 'Tòa A' },
    time: { timeRange: '14:15 - 14:45', date: 'Hôm nay, 24/10' },
    isConflict: true,
    staff: { name: 'Lan Sales', avatar: 'https://i.pravatar.cc/150?u=2' },
    status: 'Chờ xác nhận',
  },
  {
    id: 3,
    customer: { name: 'Lê Hoàng C', phone: '0912 345 678', initials: 'LC' },
    room: { name: 'P.302', building: 'Tòa B' },
    time: { timeRange: '16:30 - 17:00', date: 'Ngày mai, 25/10' },
    isConflict: false,
    staff: { name: 'Minh Landlord', avatar: '' },
    status: 'Đã xem',
  },
  {
    id: 4,
    customer: { name: 'Phạm Thị D', phone: '0933 111 222', initials: 'PD' },
    room: { name: 'P.205', building: 'Tòa A' },
    time: { timeRange: '09:00 - 09:30', date: 'Hôm qua, 23/10' },
    isConflict: false,
    staff: { name: 'Minh Landlord', avatar: '' },
    status: 'Đã hủy',
  },
]

export default function Component() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const renderStatus = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-normal rounded-full px-3 border-none">Đã xác nhận</Badge>
      case 'Chờ xác nhận':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-normal rounded-full px-3 border-none">Chờ xác nhận</Badge>
      case 'Đã xem':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal rounded-full px-3 border-none">Đã xem</Badge>
      case 'Đã hủy':
        return <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-100 font-normal rounded-full px-3 border-none">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch Xem Phòng</h1>
          <p className="text-slate-500 mt-1">Quản lý và sắp xếp lịch hẹn khách hàng đến xem căn hộ.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Tạo Lịch Mới
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-4 h-4" /> Danh sách
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarDays className="w-4 h-4" /> Lịch
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm tên, SĐT khách..." className="pl-9 bg-slate-50 border-none focus-visible:ring-1" />
          </div>
          
          <Select defaultValue="all-room">
            <SelectTrigger className="w-[140px] bg-slate-50 border-none">
              <SelectValue placeholder="Tất cả phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-room">Tất cả phòng</SelectItem>
              <SelectItem value="t1">Tòa A</SelectItem>
              <SelectItem value="t2">Tòa B</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-staff">
            <SelectTrigger className="w-[150px] bg-slate-50 border-none">
              <SelectValue placeholder="Nhân viên PT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-staff">Nhân viên PT</SelectItem>
              <SelectItem value="s1">Lan Sales</SelectItem>
              <SelectItem value="s2">Minh Landlord</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="status">
            <SelectTrigger className="w-[130px] bg-slate-50 border-none">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Trạng thái</SelectItem>
              <SelectItem value="confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="pending">Chờ xác nhận</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" size="icon" className="bg-slate-100 hover:bg-slate-200 border-none">
            <Filter className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* List Table */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl font-semibold">KHÁCH HÀNG</th>
                  <th className="px-6 py-4 font-semibold">PHÒNG QUAN TÂM</th>
                  <th className="px-6 py-4 font-semibold">THỜI GIAN</th>
                  <th className="px-6 py-4 font-semibold">NHÂN VIÊN PT</th>
                  <th className="px-6 py-4 font-semibold">TRẠNG THÁI</th>
                  <th className="px-6 py-4 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/quan-ly-nha-tro/lich-xem-phong/${item.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={item.status === 'Đã hủy' ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-700'}>{item.customer.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={`font-semibold ${item.status === 'Đã hủy' ? 'text-slate-400' : 'text-slate-900'}`}>{item.customer.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{item.customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${item.status === 'Đã hủy' ? 'text-slate-400' : 'text-slate-700'}`}>
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{item.room.name}</span>
                        <span className="text-slate-400">- {item.room.building}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={item.status === 'Đã hủy' ? 'text-slate-400' : 'text-slate-900'}>
                        <div className="font-medium">{item.time.timeRange}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{item.time.date}</div>
                        {item.isConflict && (
                          <div className="flex items-center gap-1 text-red-600 bg-red-50 w-fit px-1.5 py-0.5 rounded text-[10px] mt-1 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Trùng lịch
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${item.status === 'Đã hủy' ? 'opacity-50' : ''}`}>
                        <Avatar className="h-6 w-6">
                          {item.staff.avatar ? <AvatarImage src={item.staff.avatar} /> : <AvatarFallback className="bg-slate-200 text-xs text-slate-600">M</AvatarFallback>}
                        </Avatar>
                        <span className="text-slate-700 font-medium">{item.staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatus(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/quan-ly-nha-tro/lich-xem-phong/${item.id}`)}>Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Sửa lịch</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Hủy lịch</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="border-t border-slate-100 p-4 flex items-center justify-between text-sm text-slate-500">
            <div>Hiển thị 1-4 của 24 lịch hẹn</div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </Button>
              <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded">1</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-700 rounded">2</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-700 rounded">3</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-700 hover:bg-slate-100">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
