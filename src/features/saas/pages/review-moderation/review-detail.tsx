import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import type { TReview } from '../../types/reviews.types'
import { reviewsAdminApi } from '../../api/reviews'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ReviewModerationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [review, setReview] = useState<TReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    let ignore = false

    async function fetchReview(reviewId: number) {
      setLoading(true)
      try {
        const data = await reviewsAdminApi.getById(reviewId)
        if (!ignore) setReview(data)
      } catch (error) {
        if (!ignore) {
          toast.error('Không thể tải chi tiết đánh giá')
          console.error(error)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchReview(parseInt(id, 10))

    return () => {
      ignore = true
    }
  }, [id])

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    if (!review) return
    if ((status === 'REJECTED' || status === 'HIDDEN') && !reason.trim()) {
      toast.error('Vui lòng nhập lý do')
      return
    }

    setSubmitting(true)
    try {
      await reviewsAdminApi.updateStatus(review.id, { status, reason })
      toast.success('Đã cập nhật trạng thái')
      navigate('/admin/kiem-duyet-danh-gia')
    } catch (error) {
      toast.error('Cập nhật thất bại')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!review) return <div className="p-6">Không tìm thấy đánh giá</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chi tiết đánh giá #{review.id}</h1>
        <Badge variant={review.status === 'APPROVED' ? 'default' : 'outline'} className="px-3 py-1 text-lg">
          {review.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Người đánh giá</p>
              <p className="font-medium">{review.reviewerName || `User #${review.reviewerId}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Phòng</p>
              <p className="font-medium">{review.roomName || `Room #${review.roomId}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Điểm tổng quan</p>
              <p className="font-medium">{review.rating} ⭐</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ngày tạo</p>
              <p className="font-medium">{new Date(review.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Điểm chi tiết:</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>Sạch sẽ: {review.cleanlinessScore}</div>
              <div>Vị trí: {review.locationScore}</div>
              <div>Giá cả: {review.priceScore}</div>
              <div>Dịch vụ: {review.serviceScore}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Nội dung đánh giá:</h3>
            <p className="bg-muted rounded-md p-4">{review.content}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hành động xử lý</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do xử lý (bắt buộc nếu từ chối hoặc ẩn):</label>
            <textarea
              placeholder="Nhập lý do xử lý..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="destructive"
            disabled={submitting || !reason.trim()}
            onClick={() => handleUpdateStatus('REJECTED')}
          >
            Từ chối
          </Button>
          <Button
            variant="secondary"
            disabled={submitting || !reason.trim()}
            onClick={() => handleUpdateStatus('HIDDEN')}
          >
            Ẩn
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={submitting}
            onClick={() => handleUpdateStatus('APPROVED')}
          >
            Duyệt
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
