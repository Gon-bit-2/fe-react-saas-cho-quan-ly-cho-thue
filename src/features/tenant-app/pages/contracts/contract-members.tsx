import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Mail, Phone, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useContract } from '@/shared/api/contracts'

export default function ContractMembersPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: contract, isLoading, isError } = useContract(id)

  if (isLoading) return <div className="p-12 text-center">Đang tải thành viên…</div>
  if (isError || !contract) return <div className="p-12 text-center text-red-600">Không tìm thấy hợp đồng.</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate(`/hop-dong/${id}`)}><ArrowLeft className="mr-2 h-4 w-4" />Chi tiết hợp đồng</Button>
      <section className="rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Thành viên hợp đồng</h1><p className="text-slate-500">{contract.contractCode ?? `Hợp đồng #${contract.id}`} · tối đa {contract.room?.maxOccupants ?? '—'} người</p></div><Users className="h-8 w-8 text-blue-600" /></div>
        {!contract.members?.length ? <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-500">Hợp đồng chưa có người ở cùng.</p> : (
          <div className="divide-y">
            {contract.members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 py-4">
                <Avatar><AvatarImage alt={member.user.fullName} /><AvatarFallback>{member.user.fullName.split(' ').slice(-2).map((part) => part[0]).join('')}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><p className="font-medium">{member.user.fullName}</p><div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500"><span className="flex gap-1"><Mail className="h-4 w-4" />{member.user.email}</span><span className="flex gap-1"><Phone className="h-4 w-4" />{member.user.phone || 'Chưa cập nhật'}</span></div></div>
                <Badge variant="outline">{member.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
