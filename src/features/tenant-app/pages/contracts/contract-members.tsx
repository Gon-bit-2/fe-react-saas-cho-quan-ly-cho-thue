import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Mail, Phone, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useContract } from '@/shared/api/contracts'

/**
 * Trang xem danh sách thành viên cư trú theo hợp đồng thuê phòng
 * Hiển thị người đứng tên chính và các thành viên cùng phòng
 */
export default function ContractMembersPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: contract, isLoading, isError } = useContract(id)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="font-medium text-slate-500">Đang tải danh sách thành viên…</p>
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="font-medium text-red-600">Không tìm thấy hợp đồng hoặc đã bị xóa.</p>
        <Button variant="outline" onClick={() => navigate('/hop-dong')}>
          Quay lại danh sách hợp đồng
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-900"
        onClick={() => navigate(`/hop-dong/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại chi tiết hợp đồng
      </Button>

      {/* Main Card */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Thành viên hợp đồng</CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-500">
                {contract.contractCode ?? `Hợp đồng #${contract.id}`} • Phòng{' '}
                {contract.room?.title || contract.room?.roomCode || contract.roomId} • Sức chứa: Tối đa{' '}
                {contract.room?.maxOccupants ?? '—'} người
              </CardDescription>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!contract.members?.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
              Hợp đồng này chưa có thông tin thành viên cùng ở.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contract.members.map((member) => {
                const displayName = member.user?.fullName || member.fullName || 'Thành viên'
                const isPrimary = String(member.userId) === String(contract.renterId)
                return (
                  <div key={member.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={member.user?.avatarUrl || member.avatarUrl || undefined} />
                        <AvatarFallback className="bg-slate-100 font-semibold text-slate-700">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{displayName}</span>
                          {isPrimary ? (
                            <Badge className="border-none bg-blue-100 text-[11px] text-blue-700">
                              <Shield className="mr-1 h-3 w-3" /> Người đứng tên
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] text-slate-600">
                              {member.role || 'Thành viên ở cùng'}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {member.user?.email ||
                              (member.identityCard ? `CCCD: ${member.identityCard}` : 'Chưa có email')}
                          </span>
                          <span className="flex items-center gap-1 tabular-nums">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {member.user?.phone || member.phone || 'Chưa cập nhật SĐT'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
