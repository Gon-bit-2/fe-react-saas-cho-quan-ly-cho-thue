import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarDays, Search, User, Phone, Clock, ArrowRight, UserCheck } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { APPOINTMENT_STATUS_MAP } from '@/shared/constants/status-config'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useViewingAppointments } from '@/shared/api/viewing-appointments'
import { AssignAppointmentModal } from './components/AssignAppointmentModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Appointment, AppointmentStatus } from '@/shared/api/generated/models'
import { formatDateTime } from '@/shared/lib/utils'

/**
 * Component trang danh sách lịch hẹn xem phòng của khách thuê
 * Hỗ trợ tìm kiếm theo tên/phòng, lọc theo trạng thái và phân công nhân viên dẫn khách
 */
export function Component() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AppointmentStatus | undefined>()
  const [assigningAppointment, setAssigningAppointment] = useState<Appointment | null>(null)
  
  const { data, isLoading, isError, refetch } = useViewingAppointments({
    page: 1,
    limit: 50,
    search: search || undefined,
    status,
  })

  const appointments = data?.data || []

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-12">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch xem phòng</h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi các yêu cầu đặt hẹn xem phòng trực tiếp từ khách thuê và phân công nhân viên phụ trách.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên khách, số điện thoại hoặc mã phòng..."
            className="pl-9 bg-white border-slate-200"
          />
        </div>
        <Select
          value={status ?? 'ALL'}
          onValueChange={(value) => setStatus(value === 'ALL' ? undefined : (value as AppointmentStatus))}
        >
          <SelectTrigger className="w-full sm:w-56 bg-white border-slate-200">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.keys(APPOINTMENT_STATUS_MAP).map((value) => (
              <SelectItem key={value} value={value}>
                {APPOINTMENT_STATUS_MAP[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table Card */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách các cuộc hẹn</CardTitle>
          <CardDescription>Tổng số: {appointments.length} lịch hẹn</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-medium">Đang tải lịch hẹn...</div>
          ) : isError ? (
            <div className="py-16 text-center">
              <p className="text-red-600 mb-3">Không tải được dữ liệu lịch xem phòng.</p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-600">Chưa có lịch hẹn phù hợp</p>
              <p className="text-sm mt-1">Khi khách gửi yêu cầu xem phòng, lịch hẹn sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Khách hàng</TableHead>
                  <TableHead className="font-semibold text-slate-600">Phòng quan tâm</TableHead>
                  <TableHead className="font-semibold text-slate-600">Thời gian hẹn</TableHead>
                  <TableHead className="font-semibold text-slate-600">Nhân viên phụ trách</TableHead>
                  <TableHead className="w-36 text-center font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="w-32 text-right font-semibold text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => navigate(`/lich-xem-phong/${appointment.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{appointment.renter.fullName}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{appointment.renter.phone ?? appointment.renter.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{appointment.room.title}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{appointment.room.roomCode}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 tabular-nums">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDateTime(appointment.scheduledAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {appointment.assignedStaff ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          <span>{appointment.assignedStaff.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Chưa phân công
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        status={appointment.status}
                        statusMap={APPOINTMENT_STATUS_MAP}
                        fallbackLabel={appointment.status}
                      />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          onClick={() => setAssigningAppointment(appointment)}
                        >
                          Phân công
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-700"
                          onClick={() => navigate(`/lich-xem-phong/${appointment.id}`)}
                          title="Chi tiết"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignAppointmentModal
        appointment={assigningAppointment}
        open={!!assigningAppointment}
        onOpenChange={(open) => {
          if (!open) setAssigningAppointment(null)
        }}
      />
    </div>
  )
}
