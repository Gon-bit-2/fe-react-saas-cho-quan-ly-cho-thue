import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useAssignService } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AssignmentForm() {
  const navigate = useNavigate()
  const { mutateAsync: assignService, isPending } = useAssignService()
  
  const [formData, setFormData] = useState({
    serviceId: 0,
    roomId: 0,
    quantity: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await assignService(formData)
      navigate('/app/dich-vu-da-gan')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Gán dịch vụ</h1>
      </div>
      
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin gán dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">ID Dịch vụ</Label>
              <Input 
                id="serviceId" 
                type="number"
                value={formData.serviceId || ''} 
                onChange={(e) => setFormData({...formData, serviceId: Number(e.target.value)})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomId">Phòng (ID)</Label>
                <Input 
                  id="roomId" 
                  type="number" 
                  value={formData.roomId || ''} 
                  onChange={(e) => setFormData({...formData, roomId: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} 
                  required 
                  min={1}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
