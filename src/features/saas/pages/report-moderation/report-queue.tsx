import { useState, useEffect } from 'react'
import type { TListAdminReportsQuery, TReport } from '../../types/reports.types'
import { reportsAdminApi } from '../../api/reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router'

export function ReportQueuePage() {
  const [reports, setReports] = useState<TReport[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<TListAdminReportsQuery>({ page: 1, limit: 10 })

  useEffect(() => {
    let ignore = false

    async function fetchReports() {
      setLoading(true)
      try {
        const res = await reportsAdminApi.list(query)
        if (!ignore) setReports(res.data)
      } catch (error) {
        if (!ignore) console.error('Failed to fetch reports', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchReports()

    return () => {
      ignore = true
    }
  }, [query])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline">Chờ xử lý</Badge>
      case 'REVIEWING': return <Badge variant="secondary">Đang xử lý</Badge>
      case 'RESOLVED': return <Badge variant="default" className="bg-green-500">Đã giải quyết</Badge>
      case 'REJECTED': return <Badge variant="destructive">Từ chối</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getTargetTypeBadge = (type: string) => {
    switch (type) {
      case 'ROOM': return <Badge variant="outline">Phòng</Badge>
      case 'TENANT': return <Badge variant="outline">Chủ nhà</Badge>
      case 'REVIEW': return <Badge variant="outline">Đánh giá</Badge>
      case 'USER': return <Badge variant="outline">Người dùng</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Danh sách báo cáo vi phạm</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input 
            placeholder="Tìm kiếm báo cáo..." 
            className="max-w-xs" 
            value={query.search || ''}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <Button onClick={fetchReports}>Lọc</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Người báo cáo</TableHead>
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
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {getTargetTypeBadge(report.targetType)}
                        <span className="text-sm font-medium">{report.targetName || `#${report.targetId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[200px]">{report.reason}</div>
                    </TableCell>
                    <TableCell>{report.reporterName || `User #${report.reporterId}`}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" asChild>
                        <Link to={`/admin/bao-cao-vi-pham/${report.id}`}>Chi tiết</Link>
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
