import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Calendar, MapPin, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { APPOINTMENT_STATUS_MAP } from '@/shared/constants/status-config'
import { useUpdateViewingAppointmentStatus, useViewingAppointmentForLandlord } from '@/shared/api/viewing-appointments'
import type { AppointmentStatus } from '@/shared/api/generated/models'



export function Component() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useViewingAppointmentForLandlord(id)
  const updateStatus = useUpdateViewingAppointmentStatus(id)

  if (isLoading) return <div className="p-12 text-center">Đang tải lịch hẹn…</div>
  if (isError || !data) return <div className="p-12 text-center text-red-600">Không tìm thấy lịch hẹn.</div>

  const setStatus = (status: AppointmentStatus) => updateStatus.mutate({ status })
  const property = data.room.property
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate('/lich-xem-phong')}><ArrowLeft className="mr-2 h-4 w-4" />Quay lại</Button>
      <div className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-6 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Lịch hẹn #{data.id}</h1><div className="mt-2"><StatusBadge status={data.status} statusMap={APPOINTMENT_STATUS_MAP} fallbackLabel={data.status} /></div></div>
        <div className="flex flex-wrap gap-2">
          {data.status === 'PENDING' && <Button onClick={() => setStatus('CONFIRMED')} disabled={updateStatus.isPending}>Xác nhận</Button>}
          {['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(data.status) && <Button variant="outline" onClick={() => setStatus('CANCELED')} disabled={updateStatus.isPending}>Hủy lịch</Button>}
          {data.status === 'CONFIRMED' && <Button onClick={() => setStatus('COMPLETED')} disabled={updateStatus.isPending}>Hoàn tất</Button>}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Thông tin lịch hẹn</h2>
          <p className="flex gap-2"><Calendar className="h-5 w-5 text-blue-600" />{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(data.scheduledAt))}</p>
          <p className="font-medium">{data.room.title} ({data.room.roomCode})</p>
          <p className="text-sm text-slate-600">{data.note || 'Khách không để lại ghi chú.'}</p>
        </section>
        <section className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Khách và người phụ trách</h2>
          <p className="flex gap-2"><User className="h-5 w-5" />{data.renter.fullName}</p>
          <p className="flex gap-2"><Phone className="h-5 w-5" />{data.renter.phone ?? 'Chưa có số điện thoại'}</p>
          <p>Nhân viên: {data.assignedStaff?.fullName ?? 'Chưa phân công'}</p>
        </section>
      </div>
      {property && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-3 font-semibold">Điểm hẹn</h2>
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-5 w-5 text-blue-600" />{property.addressDetail}, {property.ward}, {property.district}, {property.province}</p>
        </section>
      )}
    </div>
  )
}
