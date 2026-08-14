import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarDays, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useViewingAppointments } from '@/shared/api/viewing-appointments'
import type { AppointmentStatus } from '@/shared/api/generated/models'

const statusLabel: Record<AppointmentStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Đã từ chối',
  RESCHEDULED: 'Đã dời lịch',
  CANCELED: 'Đã hủy',
  COMPLETED: 'Đã xem',
}

export function Component() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AppointmentStatus | undefined>()
  const { data, isLoading, isError, refetch } = useViewingAppointments({ page: 1, limit: 50, search: search || undefined, status })

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Lịch xem phòng</h1>
        <p className="mt-1 text-slate-500">Dữ liệu trực tiếp từ các yêu cầu xem phòng của khách thuê.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khách, số điện thoại hoặc phòng" className="pl-9" />
        </div>
        <Select value={status ?? 'ALL'} onValueChange={(value) => setStatus(value === 'ALL' ? undefined : value as AppointmentStatus)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            {Object.entries(statusLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">Đang tải lịch hẹn…</div>
      ) : isError ? (
        <button type="button" onClick={() => void refetch()} className="w-full py-16 text-center text-red-600">Không tải được dữ liệu. Bấm để thử lại.</button>
      ) : !data?.data.length ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-slate-500"><CalendarDays className="mx-auto mb-3 h-8 w-8" />Chưa có lịch hẹn phù hợp.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Khách hàng</th><th className="p-4">Phòng</th><th className="p-4">Thời gian</th><th className="p-4">Nhân viên</th><th className="p-4">Trạng thái</th></tr></thead>
            <tbody className="divide-y">
              {data.data.map((appointment) => (
                <tr key={appointment.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/quan-ly-nha-tro/lich-xem-phong/${appointment.id}`)}>
                  <td className="p-4"><div className="font-medium">{appointment.renter.fullName}</div><div className="text-xs text-slate-500">{appointment.renter.phone ?? appointment.renter.email}</div></td>
                  <td className="p-4"><div className="font-medium">{appointment.room.title}</div><div className="text-xs text-slate-500">{appointment.room.roomCode}</div></td>
                  <td className="p-4">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(appointment.scheduledAt))}</td>
                  <td className="p-4">{appointment.assignedStaff?.fullName ?? 'Chưa phân công'}</td>
                  <td className="p-4"><Badge variant="secondary">{statusLabel[appointment.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
