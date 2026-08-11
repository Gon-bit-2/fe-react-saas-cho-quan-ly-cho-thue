import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import type { TReport } from '../../types/reports.types'
import { reportsAdminApi } from '../../api/reports'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function ReportModerationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [report, setReport] = useState<TReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolutionNote, setResolutionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    let ignore = false

    async function fetchReport(reportId: number) {
      setLoading(true)
      try {
        const data = await reportsAdminApi.getById(reportId)
        if (!ignore) setReport(data)
      } catch (error) {
        if (!ignore) {
          toast.error('Không thể tải chi tiết báo cáo')
          console.error(error)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchReport(parseInt(id, 10))

    return () => {
      ignore = true
    }
  }, [id])

  const handleUpdateStatus = async (status: 'REVIEWING' | 'RESOLVED' | 'REJECTED') => {
    if (!report) return
    if ((status === 'RESOLVED' || status === 'REJECTED') && !resolutionNote.trim()) {
      toast.error('Vui lòng nhập kết luận xử lý')
      return
    }

    setSubmitting(true)
    try {
      await reportsAdminApi.updateStatus(report.id, { status, resolutionNote })
      toast.success('Đã cập nhật trạng thái báo cáo')
      navigate('/admin/bao-cao-vi-pham')
    } catch (error) {
      toast.error('Cập nhật thất bại')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>
  if (!report) return <div className="p-6">Không tìm thấy báo cáo</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chi tiết báo cáo #{report.id}</h1>
        <Badge variant={report.status === 'RESOLVED' ? 'default' : 'outline'} className="px-3 py-1 text-lg">
          {report.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin vi phạm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Người báo cáo</p>
              <p className="font-medium">{report.reporterName || `User #${report.reporterId}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Loại đối tượng</p>
              <p className="font-medium">{report.targetType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Đối tượng vi phạm</p>
              <p className="font-medium">{report.targetName || `#${report.targetId}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ngày báo cáo</p>
              <p className="font-medium">{new Date(report.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Lý do:</h3>
            <p className="text-destructive font-medium">{report.reason}</p>
          </div>

          {report.description && (
            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-semibold">Mô tả chi tiết:</h3>
              <p className="bg-muted rounded-md p-4">{report.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiến trình xử lý</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kết luận xử lý (bắt buộc khi Giải quyết/Từ chối):</label>
            <Textarea
              placeholder="Nhập nội dung kết luận xử lý..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" disabled={submitting} onClick={() => handleUpdateStatus('REVIEWING')}>
            Đang xử lý
          </Button>
          <Button
            variant="destructive"
            disabled={submitting || !resolutionNote.trim()}
            onClick={() => handleUpdateStatus('REJECTED')}
          >
            Từ chối báo cáo
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={submitting || !resolutionNote.trim()}
            onClick={() => handleUpdateStatus('RESOLVED')}
          >
            Đã giải quyết
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
