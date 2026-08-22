import { useParams } from 'react-router'
import { useRoomAssets } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { ASSET_CONDITION_MAP } from '@/shared/constants/status-config'

export default function RoomAssets() {
  const { roomId } = useParams()
  const { data, isLoading } = useRoomAssets(Number(roomId))

  if (isLoading) return <div>Đang tải...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.condition}
                      statusMap={ASSET_CONDITION_MAP}
                      fallbackLabel={item.condition}
                    />
                  </TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
