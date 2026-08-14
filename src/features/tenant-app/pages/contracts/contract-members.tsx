import { Link, useNavigate } from 'react-router'
import { ArrowLeft, UserPlus, Phone, Mail, Calendar, CreditCard, ChevronDown, CheckCircle2, MoreVertical, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ContractMembersPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 -ml-3 mb-2" onClick={() => navigate('/hop-dong')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Thành viên hợp đồng</h1>
          <p className="text-slate-500 mt-1">Quản lý danh sách người lưu trú tại phòng.</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-slate-700">Tỷ lệ lấp đầy</span>
              <span className="text-blue-600">2/3 Người (66%)</span>
            </div>
            <Progress value={66} className="h-2 bg-slate-100 [&>div]:bg-blue-600" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0">
            <UserPlus className="w-4 h-4 mr-2" /> Thêm thành viên
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Người đại diện */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 px-2">Người đại diện</h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 border-4 border-white shadow-md mb-4">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                <AvatarFallback>TV</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg text-slate-900">Nguyễn Trần Thảo Vy</h3>
              <p className="text-blue-600 text-sm font-medium mt-1">Đại diện thuê</p>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none mt-3 rounded-full px-3">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác thực
              </Badge>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Liên hệ */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin liên hệ</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    0901 234 567
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    vy.nguyentran@email.com
                  </div>
                </div>
              </div>

              {/* Lưu trú */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin lưu trú</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Ngày chuyển vào</span>
                      <span className="font-medium">15/10/2023</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Giá trị cọc</span>
                      <span className="font-medium">4.500.000 VNĐ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giấy tờ */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  Giấy tờ tuỳ thân
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">CMND/CCCD</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Mặt trước</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                    <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Mặt sau</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button variant="outline" className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
                Xem hồ sơ đầy đủ
              </Button>
            </div>
          </div>
        </div>

        {/* Cột phải: Thành viên khác */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900">Thành viên khác</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Lọc theo:</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-[120px] h-8 text-sm bg-white border-slate-200">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang ở</SelectItem>
                  <SelectItem value="moved">Đã chuyển đi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Existing Member */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative group hover:border-blue-200 transition-colors">
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="https://i.pravatar.cc/150?u=b042581f4e29026024d" />
                  <AvatarFallback>QB</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">Nguyễn Trần Quốc Bảo</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 text-[10px] px-1.5 border-slate-200">Con</Badge>
                    <span className="flex items-center text-[10px] text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> Đã xác thực
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">SĐT</span>
                  <span className="font-medium text-slate-700">0933 111 222</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Thời gian</span>
                  <span className="font-medium text-slate-700">15/10/2023 - Hết hạn HĐ</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 text-slate-600">Xem chi tiết</Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8 text-red-600 border-red-200 hover:bg-red-50">Xóa</Button>
              </div>
            </div>

            {/* Card 2: Empty Slot */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">Trống 1 chỗ</h3>
              <p className="text-xs text-slate-500 max-w-[180px]">Nhấn để thêm thành viên mới vào phòng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
