import { useParams } from 'react-router'
import { useRoomAssets } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const conditionMap: Record<string, string> = {
  NEW: 'Mới',
  GOOD: 'Tốt',
  NORMAL: 'Bình thường',
  DAMAGED: 'Hư hỏng',
  LOST: 'Thất lạc'
}

export default function RoomAssets() {
  const { roomId } = useParams()
  const { data, isLoading } = useRoomAssets(Number(roomId))
  
  if (isLoading) return <div>Đang tải...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Tài sản trong phòng {roomId}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài sản</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài sản</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.category?.name || item.categoryId}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={item.condition === 'DAMAGED' || item.condition === 'LOST' ? 'destructive' : 'default'}>
                      {conditionMap[item.condition] || item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
