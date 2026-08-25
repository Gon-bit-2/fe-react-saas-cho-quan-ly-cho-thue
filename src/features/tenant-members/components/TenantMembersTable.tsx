import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantMembersApi } from '../api/tenant-members.api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MoreHorizontal, ShieldAlert, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { TenantMember } from '../types'
import { ChangeRoleModal } from './ChangeRoleModal'

export const TenantMembersTable: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)

  const { data: members, isLoading } = useQuery({
    queryKey: ['tenant-members'],
    queryFn: tenantMembersApi.getTenantMembers,
  })

  const deleteMutation = useMutation({
    mutationFn: tenantMembersApi.removeTenantMember,
    onSuccess: () => {
      toast.success('Đã xóa nhân viên thành công')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa nhân viên')
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleOpenChangeRole = (member: TenantMember) => {
    setSelectedMember(member)
    setIsChangeRoleOpen(true)
  }

  if (isLoading) return <div>Đang tải dữ liệu...</div>
  if (!members?.length) return <div>Chưa có nhân viên nào trong hệ thống.</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tham gia</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.avatarUrl} />
                    <AvatarFallback>{member.user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.user.fullName}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{member.user.email}</span>
                  <span className="text-muted-foreground">{member.user.phone}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{member.role.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {member.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(member.joinedAt), 'dd/MM/yyyy', { locale: vi })}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenChangeRole(member)}>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Thay đổi quyền
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa nhân viên
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedMember && (
        <ChangeRoleModal member={selectedMember} open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen} />
      )}
    </div>
  )
}
