import { useState } from 'react'
import { Link } from 'react-router'
import { useMyReviews, type ReviewStatus } from '@/shared/api/reviews'

export function Component() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  
  const { data, isLoading } = useMyReviews({ page, limit: 10, status: status || undefined })
  
  const reviews = data?.data || []
  const meta = data?.meta

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-warning-container text-on-warning-container">Chờ duyệt</span>
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-success-container text-on-success-container">Đã duyệt</span>
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-error-container text-on-error-container">Từ chối</span>
      case 'HIDDEN':
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-container-highest text-on-surface">Đã ẩn</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-text-main">Đánh giá của tôi</h1>
          <p className="font-body-md text-on-surface-variant mt-1">Danh sách các đánh giá bạn đã gửi cho các phòng trọ</p>
        </div>
        
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-surface border border-surface-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="HIDDEN">Đã ẩn</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-surface border border-surface-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <Link to={`/phong/${review.room.id}`} className="font-title-lg text-primary hover:underline">
                    {review.room.title || 'Phòng không có tên'}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-on-surface-variant">Mã phòng: {review.room.roomCode}</span>
                    <span className="text-surface-border text-sm">•</span>
                    <span className="text-sm text-on-surface-variant">Hợp đồng: {review.contract.code}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(review.status)}
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`material-symbols-outlined text-lg ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-border'}`}
                    style={star <= review.rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    star
                  </span>
                ))}
                <span className="ml-2 text-sm font-medium">{review.rating.toFixed(1)}</span>
              </div>
              
              {review.content && (
                <p className="text-on-surface font-body-md whitespace-pre-wrap mt-2">{review.content}</p>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-surface-border">
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant mb-1">Sạch sẽ</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">cleaning_services</span>
                    <span className="text-sm font-medium">{review.cleanlinessScore}/5</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant mb-1">Vị trí</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    <span className="text-sm font-medium">{review.locationScore}/5</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant mb-1">Giá cả</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
                    <span className="text-sm font-medium">{review.priceScore}/5</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant mb-1">Dịch vụ</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">support_agent</span>
                    <span className="text-sm font-medium">{review.serviceScore}/5</span>
                  </div>
                </div>
              </div>
              
              {review.status === 'REJECTED' && review.moderationReason && (
                <div className="mt-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                  <span className="font-bold">Lý do từ chối:</span> {review.moderationReason}
                </div>
              )}
              
              <div className="mt-4 text-xs text-on-surface-variant text-right">
                Ngày gửi: {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
          
          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-surface-border rounded-lg disabled:opacity-50 hover:bg-surface-container transition-colors"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm flex items-center">
                Trang {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 border border-surface-border rounded-lg disabled:opacity-50 hover:bg-surface-container transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border-surface-border rounded-xl border p-12 text-center shadow-sm">
          <div className="bg-surface-container mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">reviews</span>
          </div>
          <h3 className="font-headline-sm text-text-main mt-4">Chưa có đánh giá nào</h3>
          <p className="font-body-md text-on-surface-variant mt-2 mb-6">
            Bạn chưa gửi đánh giá nào hoặc không có đánh giá phù hợp với bộ lọc.
          </p>
          <Link
            to="/phong"
            className="bg-primary text-on-primary font-label-md inline-flex items-center justify-center rounded-lg px-6 py-2.5 transition-opacity hover:opacity-90"
          >
            Xem phòng đã thuê
          </Link>
        </div>
      )}
    </div>
  )
}
