import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Calendar, Clock, CheckCircle2, XCircle, ArrowRight, MapPin } from 'lucide-react'
import type { ViewingSchedule, AppointmentStatus } from '@/types/viewing-schedule'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useViewingSchedules = (_filters: unknown) => {
  return {
    data: {
      data: [
        {
          id: 101,
          tenantId: 1,
          renterId: 501,
          roomId: 201,
          propertyId: 10,
          status: 'PENDING',
          scheduledAt: '2026-08-10T14:30:00Z',
          landlordNote: '',
          createdAt: '2026-08-05T10:00:00Z',
          updatedAt: '2026-08-05T10:00:00Z',
        },
        {
          id: 102,
          tenantId: 1,
          renterId: 502,
          roomId: 205,
          propertyId: 10,
          status: 'CONFIRMED',
          scheduledAt: '2026-08-12T09:00:00Z',
          landlordNote: 'Đã hẹn khách ở sảnh.',
          createdAt: '2026-08-06T14:30:00Z',
          updatedAt: '2026-08-07T09:00:00Z',
        },
      ] as ViewingSchedule[]
    },
    isLoading: false
  }
}

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading } = useViewingSchedules({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-sm"><Clock className="w-3 h-3 mr-1" /> Chờ xác nhận</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác nhận</Badge>
      case 'COMPLETED':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã xem xong</Badge>
      case 'REJECTED':
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-sm"><XCircle className="w-3 h-3 mr-1" /> Đã hủy</Badge>
      case 'RESCHEDULED':
        return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Dời lịch</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString)
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lịch xem phòng</h2>
          <p className="text-slate-500 mt-1">Sắp xếp và quản lý các cuộc hẹn xem phòng với khách hàng</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo mã phòng hoặc khách..."
            className="pl-9 bg-slate-50/50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-slate-50/50 border-slate-200">
            <SelectValue placeholder="Trạng thái lịch hẹn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="COMPLETED">Đã xem xong</SelectItem>
            <SelectItem value="CANCELED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] py-4 text-slate-600 font-semibold text-center">Mã Đặt</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold">Khách thuê</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold">Phòng</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold">Thời gian hẹn</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold text-center">Trạng thái</TableHead>
              <TableHead className="text-right py-4 text-slate-600 font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="border-slate-200 border-t-slate-900 h-8 w-8 animate-spin rounded-full border-4" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Calendar className="h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">Chưa có lịch hẹn nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((schedule: ViewingSchedule) => {
                const dt = schedule.scheduledAt ? formatDateTime(schedule.scheduledAt) : null
                return (
                  <TableRow key={schedule.id} className="group transition-colors hover:bg-slate-50/80 cursor-default">
                    <TableCell className="text-center font-medium text-slate-500 py-4">
                      #{schedule.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">Khách #{schedule.renterId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">P.{schedule.roomId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dt ? (
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md text-sm">
                            {dt.time}
                          </div>
                          <div className="text-slate-500 text-sm">
                            {dt.date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Chưa hẹn lịch cụ thể</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(schedule.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => navigate(`/app/quan-ly-nha-tro/lich-xem-phong/${schedule.id}`)}
                      >
                        Chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
