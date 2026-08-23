import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
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
import { useAuth } from '@/shared/hooks/use-auth'
import { cn } from '@/shared/lib/utils'
import { reviewsControllerCreate } from '@/shared/api/generated/reviews/reviews'

const formSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
  content: z.string().min(10, 'Nhận xét phải có ít nhất 10 ký tự').max(1000, 'Nhận xét tối đa 1000 ký tự'),
})

type FormValues = z.infer<typeof formSchema>

interface ReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: number
  onSuccess?: () => void
}

export function ReviewModal({ open, onOpenChange, roomId, onSuccess }: ReviewModalProps) {
  const { state } = useAuth()
  const isAuthenticated = state === 'authenticated'
  const [hoverRating, setHoverRating] = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      content: '',
    },
  })

  const { mutate: createReview, isPending } = useMutation({
    mutationFn: (data: Parameters<typeof reviewsControllerCreate>[0]) => reviewsControllerCreate(data),
    onSuccess: () => {
      toast.success('Gửi đánh giá thành công', {
        description: 'Đánh giá của bạn đang chờ phê duyệt từ ban quản trị.',
      })
      form.reset()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error('Gửi đánh giá thất bại', {
        description: err?.response?.data?.message || 'Bạn chỉ có thể đánh giá phòng mà bạn đã từng thuê.',
      })
    },
  })

  const onSubmit = (values: FormValues) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      return
    }

    createReview({
      roomId,
      data: {
        rating: values.rating,
        content: values.content,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đánh giá phòng</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm của bạn về phòng này để giúp những người thuê khác.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chất lượng</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={cn(
                            'p-1 transition-colors focus:outline-none',
                            (hoverRating || field.value) >= star ? 'text-yellow-400' : 'text-gray-300',
                          )}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => field.onChange(star)}
                        >
                          <Star className="h-8 w-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhận xét</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả trải nghiệm của bạn (vị trí, an ninh, tiện nghi, chủ trọ...)"
                      className="h-32 resize-none"
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
                {isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
