import { useState, useEffect } from 'react'
import type { TListAdminReviewsQuery, TReview } from '../../types/reviews.types'
import { reviewsAdminApi } from '../../api/reviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router'

export function ReviewQueuePage() {
  const [reviews, setReviews] = useState<TReview[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<TListAdminReviewsQuery>({ page: 1, limit: 10 })

  useEffect(() => {
    let ignore = false

    async function fetchReviews() {
      setLoading(true)
      try {
        const res = await reviewsAdminApi.list(query)
        if (!ignore) setReviews(res.data)
      } catch (error) {
        if (!ignore) console.error('Failed to fetch reviews', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchReviews()

    return () => {
      ignore = true
    }
  }, [query])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline">Chờ duyệt</Badge>
      case 'APPROVED': return <Badge variant="default" className="bg-green-500">Đã duyệt</Badge>
      case 'REJECTED': return <Badge variant="destructive">Từ chối</Badge>
      case 'HIDDEN': return <Badge variant="secondary">Đã ẩn</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Kiểm duyệt đánh giá</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input 
            placeholder="Tìm kiếm đánh giá..." 
            className="max-w-xs" 
            value={query.search || ''}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <Button onClick={fetchReviews}>Lọc</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Người đánh giá</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Đang tải...</TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.id}</TableCell>
                    <TableCell>{review.reviewerName || `User #${review.reviewerId}`}</TableCell>
                    <TableCell>{review.roomName || `Room #${review.roomId}`}</TableCell>
                    <TableCell>
                      <div className="font-medium">{review.rating} ⭐</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{review.content}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" asChild>
                        <Link to={`/admin/kiem-duyet-danh-gia/${review.id}`}>Chi tiết</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
