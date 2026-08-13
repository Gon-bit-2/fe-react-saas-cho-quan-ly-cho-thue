import { useParams, Link } from 'react-router'
import { useHandover } from '@/shared/api/handovers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HandoverDetail() {
  const { id } = useParams()
  const { data: handover, isLoading } = useHandover(Number(id))
  
  if (isLoading) return <div>Đang tải...</div>
  if (!handover) return <div>Không tìm thấy biên bản bàn giao</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Chi tiết bàn giao #{handover.id}</h1>
        {handover.status === 'DISPUTED' && (
          <Button variant="destructive" asChild>
            <Link to={`/ban-giao/${handover.id}/tranh-chap`}>Xử lý tranh chấp</Link>
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><span className="font-medium">Loại:</span> {handover.type === 'CHECKIN' ? 'Nhận phòng' : 'Trả phòng'}</div>
          <div>
            <span className="font-medium">Trạng thái:</span> 
            <Badge className="ml-2" variant={handover.status === 'DISPUTED' ? 'destructive' : 'default'}>
              {handover.status}
            </Badge>
          </div>
          <div><span className="font-medium">Ngày bàn giao:</span> {new Date(handover.handoverDate).toLocaleString('vi-VN')}</div>
          {handover.notes && <div><span className="font-medium">Ghi chú:</span> {handover.notes}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
