import { Link } from 'react-router'
import { useServiceAssignments } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AssignmentList() {
  const { data, isLoading } = useServiceAssignments()
  
  if (isLoading) return <div>Đang tải...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Danh sách dịch vụ đã gán</h1>
        <Button asChild>
          <Link to="/dich-vu-da-gan/tao-moi">
            <Plus className="mr-2 h-4 w-4" /> Gán dịch vụ
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ đã gán cho phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Ngày gán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.service?.name || item.serviceId}</TableCell>
                  <TableCell>Phòng {item.roomId}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{new Date(item.assignedDate).toLocaleDateString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
