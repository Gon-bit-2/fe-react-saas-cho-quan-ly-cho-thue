import React, { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { tenantMembersApi } from '../api/tenant-members.api'
import type { TenantMember } from '../types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  roleId: z.string().min(1, 'Vui lòng chọn một quyền'),
})

type FormValues = z.infer<typeof formSchema>

interface ChangeRoleModalProps {
  member: TenantMember
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ member, open, onOpenChange }) => {
  const queryClient = useQueryClient()

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['tenant-assignable-roles'],
    queryFn: tenantMembersApi.getAssignableRoles,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: member.roleId,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({ roleId: member.roleId })
    }
  }, [open, member, form])

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => tenantMembersApi.updateMemberRole(member.id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật quyền thành công')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật quyền')
    },
  })

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thay đổi quyền hạn</DialogTitle>
          <DialogDescription>
            Chọn quyền hạn mới cho nhân viên <b>{member.user.fullName}</b>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
