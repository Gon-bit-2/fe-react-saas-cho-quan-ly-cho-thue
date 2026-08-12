import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useCreateService } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ServiceCreate() {
  const navigate = useNavigate()
  const { mutateAsync: createService, isPending } = useCreateService()
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    unit: '',
    type: 'SERVICE'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createService(formData)
      navigate('/dich-vu')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Tạo dịch vụ mới</h1>
      </div>
      
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên dịch vụ</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Đơn giá (VND)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Đơn vị tính</Label>
                <Input 
                  id="unit" 
                  placeholder="Ví dụ: phòng, người, xe..." 
                  value={formData.unit} 
                  onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu dịch vụ'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
