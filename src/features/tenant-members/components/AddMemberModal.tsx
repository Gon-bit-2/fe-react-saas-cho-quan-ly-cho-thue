import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

import { tenantMembersApi } from '../api/tenant-members.api'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên').max(255, 'Tên quá dài'),
  email: z.string().email('Email không đúng định dạng'),
  roleId: z.string().min(1, 'Vui lòng chọn một quyền'),
})

type FormValues = z.infer<typeof formSchema>

export const AddMemberModal: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const queryClient = useQueryClient()

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['tenant-assignable-roles'],
    queryFn: tenantMembersApi.getAssignableRoles,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      roleId: '',
    },
  })

  const addMutation = useMutation({
    mutationFn: tenantMembersApi.addTenantMember,
    onSuccess: () => {
      toast.success('Đã thêm nhân sự thành công. Một email chứa thông tin đăng nhập đã được gửi tới nhân viên.')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      form.reset()
      setOpen(false)
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm nhân viên')
    },
  })

  const onSubmit = (data: FormValues) => {
    addMutation.mutate(data)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>Nhân viên sẽ nhận được một email để đăng nhập vào hệ thống quản lý.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="ví dụ: nhanvien@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quyền hạn</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingRoles}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quyền hạn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={addMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Đang lưu...' : 'Thêm nhân viên'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
