import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, FileText, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRenter, useRenterHistory } from '@/shared/api/renters'

export default function Component() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: renter, isLoading, isError } = useRenter(id)
  const { data: history } = useRenterHistory(id)

  if (isLoading) return <div className="p-12 text-center">Đang tải người thuê…</div>
  if (isError || !renter) return <div className="p-12 text-center text-red-600">Không tìm thấy người thuê.</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate('/nguoi-thue')}><ArrowLeft className="mr-2 h-4 w-4" />Danh sách người thuê</Button>
      <section className="rounded-xl border bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20"><AvatarFallback className="text-xl">{renter.fullName.split(' ').slice(-2).map((part) => part[0]).join('')}</AvatarFallback></Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{renter.fullName}</h1><Badge variant="secondary">{renter.verificationStatus}</Badge></div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p className="flex gap-2"><Mail className="h-4 w-4" />{renter.email}</p>
              <p className="flex gap-2"><Phone className="h-4 w-4" />{renter.phone ?? 'Chưa cập nhật'}</p>
              <p className="flex gap-2"><ShieldCheck className="h-4 w-4" />CCCD: {renter.identityNumber ?? 'Chưa cập nhật'}</p>
              <p className="flex gap-2"><MapPin className="h-4 w-4" />{renter.permanentAddress ?? 'Chưa cập nhật địa chỉ thường trú'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><FileText className="h-5 w-5" />Lịch sử thuê</h2>
        {!history?.data.length ? <p className="text-slate-500">Chưa có lịch sử thuê trong tenant này.</p> : (
          <div className="divide-y">
            {history.data.map((item) => (
              <button key={item.id} type="button" onClick={() => navigate(`/hop-dong/${item.contractId}`)} className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-slate-50">
                <div><p className="font-medium">{item.room.title} ({item.room.roomCode})</p><p className="text-sm text-slate-500">{item.room.property.name} · {new Intl.DateTimeFormat('vi-VN').format(new Date(item.startedAt))}{item.endedAt ? ` – ${new Intl.DateTimeFormat('vi-VN').format(new Date(item.endedAt))}` : ''}</p></div>
                <Badge variant="outline">{item.status}</Badge>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
