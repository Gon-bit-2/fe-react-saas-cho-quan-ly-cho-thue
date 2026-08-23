import { Link } from 'react-router'
import { useServices } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { SERVICE_STATUS_MAP } from '@/shared/constants/status-config'
import { Plus } from 'lucide-react'

export default function ServiceList() {
  const { data, isLoading } = useServices()

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Danh mục dịch vụ</h1>
        <Button asChild>
          <Link to="/dich-vu/tao-moi">
            <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Đơn vị tính</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.itemType}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      item.defaultUnitPrice,
                    )}
                  </TableCell>
                  <TableCell>{item.unitLabel}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                      statusMap={SERVICE_STATUS_MAP}
                      fallbackLabel={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dich-vu/${item.id}/chinh-sua`}>Sửa</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
