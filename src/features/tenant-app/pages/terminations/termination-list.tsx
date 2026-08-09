import { useTerminations, useApproveTermination } from '@/shared/api/terminations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusMap: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
}

export default function TerminationList() {
  const { data, isLoading, refetch } = useTerminations()
  
  if (isLoading) return <div>Đang tải...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Yêu cầu kết thúc hợp đồng</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Ngày yêu cầu</TableHead>
                <TableHead>Ngày mong muốn kết thúc</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.contractId}</TableCell>
                  <TableCell>{new Date(item.requestedDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{new Date(item.desiredEndDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'PENDING' ? 'secondary' : item.status === 'APPROVED' ? 'default' : 'outline'}>
                      {statusMap[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === 'PENDING' && (
                      <ApproveButton id={item.id} onApprove={() => refetch()} />
                    )}
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

function ApproveButton({ id, onApprove }: { id: number, onApprove: () => void }) {
  const { mutateAsync: approve, isPending } = useApproveTermination(id)
  
  const handleApprove = async () => {
    try {
      await approve()
      onApprove()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Button size="sm" onClick={handleApprove} disabled={isPending}>
      {isPending ? 'Đang duyệt...' : 'Duyệt'}
    </Button>
  )
}
