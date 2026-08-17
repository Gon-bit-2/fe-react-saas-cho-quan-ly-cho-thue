import { useState } from 'react'
import { useOcrControllerList, ocrControllerAccept } from '@/shared/api/generated/ocr/ocr'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'

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
      toast.success('Đã xác nhận và ghi chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['ocr-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi xác nhận chỉ số')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhận diện OCR</h1>
          <p className="mt-1 text-sm text-slate-500">Kiểm tra kết quả trí tuệ nhân tạo đọc ảnh công tơ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
            <p className="mt-2">Đang tải kết quả...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
            <p>Không có kết quả OCR nào đang cần xác nhận.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
                <span className="font-medium text-slate-800">Job #{job.id}</span>
                <Badge className="bg-emerald-100 text-emerald-800">Hoàn thành</Badge>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <img src={job.imageUrl} alt="Meter" className="h-full w-full object-contain" />
                </div>

                <div className="bg-primary/5 border-primary/10 rounded-lg border p-4">
                  <div className="mb-1 text-sm text-slate-500">Kết quả đọc được</div>
                  <div className="text-primary font-mono text-3xl font-bold">{job.resultData?.reading || 'N/A'}</div>
                </div>

                <div className="text-sm text-slate-600">
                  <div className="flex justify-between py-1">
                    <span>Độ tin cậy:</span>
                    <span className="font-medium">
                      {job.resultData?.confidence ? Math.round(job.resultData.confidence * 100) + '%' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-t border-slate-100 p-4">
                <Button variant="outline" className="flex-1" onClick={() => toast.error('Tính năng đang phát triển')}>
                  Chỉnh sửa
                </Button>
                <Button className="flex-1" disabled={isProcessing} onClick={() => processReading(job.id)}>
                  Xác nhận
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
