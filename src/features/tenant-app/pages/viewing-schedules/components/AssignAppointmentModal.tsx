import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { tenantMembersApi } from '@/features/tenant-members/api/tenant-members.api'
import { useAssignViewingAppointment } from '@/shared/api/viewing-appointments'
import type { Appointment } from '@/shared/api/generated/models'

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
  staffId: z.string().min(1, 'Vui lòng chọn nhân viên'),
})

type FormValues = z.infer<typeof formSchema>

interface AssignAppointmentModalProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AssignAppointmentModal: React.FC<AssignAppointmentModalProps> = ({ appointment, open, onOpenChange }) => {
  const assignMutation = useAssignViewingAppointment(appointment?.id ?? 0)

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['tenant-members'],
    queryFn: tenantMembersApi.getTenantMembers,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: '',
    },
  })

  useEffect(() => {
    if (open && appointment) {
      form.reset({
        staffId: appointment.assignedStaffId ? appointment.assignedStaffId.toString() : '',
      })
    }
  }, [open, appointment, form])

  const onSubmit = (data: FormValues) => {
    if (!appointment) return

    assignMutation.mutate(
      { staffId: parseInt(data.staffId, 10) },
      {
        onSuccess: () => {
          toast.success('Đã phân công nhân viên thành công')
          onOpenChange(false)
        },
        onError: (error: Error & { response?: { status: number } }) => {
          if (error?.response?.status === 409) {
            toast.error('Lịch xem phòng hoặc nhân viên đã bị trùng với lịch khác')
          } else if (error?.response?.status === 400) {
            toast.error('Nhân viên không hợp lệ hoặc không có quyền')
          } else {
            toast.error('Có lỗi xảy ra khi phân công lịch hẹn')
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Phân công lịch hẹn</DialogTitle>
          <DialogDescription>
            Chọn nhân viên để dẫn khách <b>{appointment?.renter?.fullName}</b> xem phòng{' '}
            <b>{appointment?.room?.title}</b>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhân viên phụ trách</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingMembers}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members?.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.user.fullName} ({member.role.name})
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
                disabled={assignMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? 'Đang lưu...' : 'Lưu phân công'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
