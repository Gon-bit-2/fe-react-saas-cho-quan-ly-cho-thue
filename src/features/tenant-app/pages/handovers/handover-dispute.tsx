import { useParams, useNavigate } from 'react-router'
import { useState } from 'react'
import { useHandover, useResolveHandover } from '@/shared/api/handovers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HandoverDispute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: handover, isLoading } = useHandover(Number(id))
  const { mutateAsync: resolveHandover, isPending } = useResolveHandover(Number(id))
  
  const [notes, setNotes] = useState('')

  if (isLoading) return <div>Đang tải...</div>
  if (!handover) return <div>Không tìm thấy biên bản bàn giao</div>
  if (handover.status !== 'DISPUTED') return <div>Biên bản không trong trạng thái tranh chấp</div>

  const handleResolve = async () => {
    try {
      await resolveHandover({ notes })
      navigate(`/app/ban-giao/${id}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Xử lý tranh chấp bàn giao #{handover.id}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nội dung tranh chấp hiện tại</CardTitle>
          <CardDescription>{handover.notes}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Giải pháp / Ghi chú xử lý</Label>
            <Input 
              id="notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Nhập ghi chú xử lý tranh chấp..." 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
          <Button onClick={handleResolve} disabled={!notes || isPending}>
            {isPending ? 'Đang xử lý...' : 'Giải quyết tranh chấp'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
