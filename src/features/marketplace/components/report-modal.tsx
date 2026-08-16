import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportsControllerCreate } from '@/shared/api/generated/reports/reports'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/use-auth'

const ReasonType = {
  SCAM: 'SCAM',
  INACCURATE_INFO: 'INACCURATE_INFO',
  SPAM: 'SPAM',
  HARASSMENT: 'HARASSMENT',
  OTHER: 'OTHER',
} as const

type ReasonType = (typeof ReasonType)[keyof typeof ReasonType]

const formSchema = z.object({
  reasonType: z.nativeEnum(ReasonType),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').max(1000, 'Mô tả tối đa 1000 ký tự'),
})

type FormValues = z.infer<typeof formSchema>

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetId: number
  targetType: 'ROOM' | 'LANDLORD'
}

const REASON_LABELS: Record<ReasonType, string> = {
  SCAM: 'Lừa đảo',
  INACCURATE_INFO: 'Thông tin không chính xác',
  SPAM: 'Spam, quảng cáo',
  HARASSMENT: 'Quấy rối, xúc phạm',
  OTHER: 'Lý do khác',
}

export function ReportModal({ open, onOpenChange, targetId, targetType }: ReportModalProps) {
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reasonType: ReasonType.INACCURATE_INFO,
      description: '',
    },
  })

  const { mutate: createReport, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof reportsControllerCreate>[0]) => reportsControllerCreate(data),
    onSuccess: () => {
      toast.success('Gửi báo cáo thành công', {
        description: 'Cảm ơn bạn đã phản hồi. Quản trị viên sẽ xem xét báo cáo của bạn.',
      })
      form.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error('Gửi báo cáo thất bại', {
        description: error?.response?.data?.message || 'Đã có lỗi xảy ra',
      })
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để gửi báo cáo')
      return
    }

    createReport({
      targetId: targetId.toString(),
      targetType: targetType === 'LANDLORD' ? 'USER' : targetType,
      reason: values.reasonType,
      description: values.description,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Báo cáo vi phạm</DialogTitle>
          <DialogDescription>
            Hãy cho chúng tôi biết vấn đề với {targetType === 'ROOM' ? 'phòng' : 'chủ trọ'} này để chúng tôi xem xét.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reasonType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do báo cáo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(REASON_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cung cấp thêm thông tin chi tiết về vấn đề này..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
