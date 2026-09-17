import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantMembersApi } from '../api/tenant-members.api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MoreHorizontal, ShieldAlert, Trash2, Search, Mail, Phone, Calendar, UserCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { TenantMember } from '../types'
import { ChangeRoleModal } from './ChangeRoleModal'

/**
 * Hiển thị huy hiệu (Badge) vai trò của nhân viên với màu sắc ngữ nghĩa
 */
const renderRoleBadge = (roleName: string) => {
  const normalized = roleName.toUpperCase()
  if (normalized.includes('ADMIN') || normalized.includes('CHỦ')) {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">{roleName}</Badge>
  }
  if (normalized.includes('QUẢN LÝ') || normalized.includes('MANAGER')) {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{roleName}</Badge>
  }
  if (normalized.includes('KẾ TOÁN') || normalized.includes('ACCOUNTANT')) {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">{roleName}</Badge>
  }
  return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">{roleName}</Badge>
}

/**
 * Component bảng danh sách thành viên nhân sự trong tổ chức
 * Hỗ trợ tìm kiếm, lọc, sửa quyền và xóa nhân viên với hộp thoại xác nhận
 */
export const TenantMembersTable: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<TenantMember | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TenantMember | null>(null)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)

  const { data: members, isLoading } = useQuery({
    queryKey: ['tenant-members'],
    queryFn: tenantMembersApi.getTenantMembers,
  })

  const deleteMutation = useMutation({
    mutationFn: tenantMembersApi.removeTenantMember,
    onSuccess: () => {
      toast.success('Đã xóa nhân viên khỏi hệ thống')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      setMemberToDelete(null)
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xóa nhân viên')
    },
  })

  /**
   * Xử lý xác nhận xóa nhân viên
   */
  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete.id)
    }
  }

  /**
   * Mở modal thay đổi quyền của nhân viên
   */
  const handleOpenChangeRole = (member: TenantMember) => {
    setSelectedMember(member)
    setIsChangeRoleOpen(true)
  }

  const memberList = members || []
  const filteredMembers = memberList.filter((m) => {
    const term = searchTerm.toLowerCase()
    return (
      m.user.fullName.toLowerCase().includes(term) ||
      m.user.email.toLowerCase().includes(term) ||
      (m.user.phone && m.user.phone.includes(term))
    )
  })

  return (
    <div className="space-y-4">
      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, email, SĐT nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách nhân sự</CardTitle>
          <CardDescription>Tổng số: {filteredMembers.length} nhân viên</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-slate-100 bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Nhân viên</TableHead>
                  <TableHead className="font-semibold text-slate-600">Liên hệ</TableHead>
                  <TableHead className="font-semibold text-slate-600">Vai trò</TableHead>
                  <TableHead className="text-center font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày tham gia</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-medium">
                      Đang tải danh sách nhân viên...
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-slate-500">
                      Chưa có nhân viên nào phù hợp với tìm kiếm.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-200">
                            <AvatarImage src={member.user.avatarUrl} />
                            <AvatarFallback className="bg-slate-100 text-slate-700 font-medium">
                              {member.user.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{member.user.fullName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-sm">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {member.user.email}
                          </span>
                          {member.user.phone && (
                            <span className="flex items-center gap-1.5 text-slate-500 tabular-nums text-xs">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {member.user.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{renderRoleBadge(member.role.name)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            member.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none'
                          }
                        >
                          <UserCheck className="mr-1 h-3 w-3" />
                          {member.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 tabular-nums">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {format(new Date(member.joinedAt), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenChangeRole(member)}>
                              <ShieldAlert className="mr-2 h-4 w-4 text-blue-600" />
                              Thay đổi quyền
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => setMemberToDelete(member)}>
                              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                              Xóa nhân viên
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal thay đổi vai trò */}
      {selectedMember && (
        <ChangeRoleModal member={selectedMember} open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen} />
      )}

      {/* Confirmation Dialog thay cho window.confirm */}
      <Dialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên <b>{memberToDelete?.user.fullName}</b> khỏi hệ thống quản lý? Nhân viên này sẽ không còn quyền truy cập vào dữ liệu của bạn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToDelete(null)} disabled={deleteMutation.isPending}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa nhân viên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
