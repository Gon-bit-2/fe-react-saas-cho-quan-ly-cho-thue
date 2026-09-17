import { useState } from 'react'
import { Link } from 'react-router'
import { useOcrControllerList, ocrControllerAccept } from '@/shared/api/generated/ocr/ocr'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
  Camera,
  RefreshCw,
} from 'lucide-react'

/**
 * Trang Xem xét và phê duyệt kết quả nhận diện chỉ số công tơ từ AI (OCR).
 * Giúp chủ trọ kiểm tra độ tin cậy và đối soát ảnh trước khi chấp thuận ghi nhận.
 */
export function OcrReviewPage() {
  const queryClient = useQueryClient()
  const [filters] = useState({
    page: 1,
    limit: 20,
    status: 'SUCCESS' as const,
  })

  const { data: response, isLoading } = useOcrControllerList(filters)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs = (response as unknown as { data?: Array<any> })?.data || []

  const { mutate: processReading, isPending: isProcessing } = useMutation({
    mutationFn: (jobId: number) => {
      const today = new Date()
      // Lấy ngày mùng 1 của tháng hiện tại
      const billingMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      return ocrControllerAccept(jobId, { billingMonth })
    },
    onSuccess: () => {
      toast.success('Đã xác nhận và ghi nhận chỉ số vào hệ thống')
      queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xác nhận chỉ số')
    },
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs"
          >
            <Link to="/dien-nuoc/chi-so">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/dien-nuoc/chi-so" className="hover:text-blue-600">Chỉ số</Link>
              <span>/</span>
              <span className="font-medium text-slate-900">Duyệt ảnh OCR</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Đối Soát Kết Quả Nhận Diện OCR
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] })}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới
          </Button>
          <Button size="sm" asChild className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Link to="/dien-nuoc/cong-to/ghi-chi-so">
              <Camera className="h-3.5 w-3.5" /> Chụp thêm ảnh
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid Cards Review */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-purple-600" />}
              title="Không có tác vụ OCR nào chờ duyệt"
              description="Tất cả các ảnh công tơ tải lên đã được đối soát hoặc chưa có ảnh mới nào được gửi tới hệ thống."
              action={
                <Button size="sm" asChild className="text-xs">
                  <Link to="/dien-nuoc/cong-to/ghi-chi-so">Tải ảnh công tơ ngay</Link>
                </Button>
              }
            />
          </div>
        ) : (
          jobs.map((job) => {
            const confidence = job.resultData?.confidence ? Math.round(job.resultData.confidence * 100) : null
            const isHighConfidence = confidence !== null && confidence >= 85

            return (
              <div
                key={job.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-sm"
              >
                {/* Card Top Banner */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <span className="text-xs font-semibold text-slate-700">Tác vụ #{job.id}</span>
                  <Badge
                    variant="outline"
                    className={
                      isHighConfidence
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                        : 'border-amber-200 bg-amber-50 text-amber-700 text-xs'
                    }
                  >
                    {isHighConfidence ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Tin cậy cao ({confidence}%)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-amber-600" /> Cần đối soát ({confidence ?? 'N/A'}%)
                      </span>
                    )}
                  </Badge>
                </div>

                {/* Body Image & AI Result */}
                <div className="flex flex-1 flex-col gap-4 p-4">
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-slate-100 bg-slate-900">
                    <img
                      src={job.imageUrl}
                      alt="Mặt đồng hồ"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* AI Result Callout */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Chỉ số AI đọc được
                    </span>
                    <div className="mt-1 font-mono text-3xl font-bold tracking-tight text-blue-600 tabular-nums">
                      {job.resultData?.reading ?? 'Không đọc được'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  <Button
                    className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                    disabled={isProcessing}
                    onClick={() => processReading(job.id)}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {isProcessing ? 'Đang lưu...' : 'Xác nhận chỉ số'}
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
