import { useParams, useNavigate } from 'react-router'
import { useState } from 'react'
import { useService, useUpdateService } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Service } from '@/types/service'

export default function ServiceEdit() {
  const { id } = useParams()
  const { data: service, isLoading } = useService(Number(id))

  if (isLoading) return <div>Đang tải...</div>
  if (!service) return <div>Không tìm thấy dịch vụ</div>

  return <ServiceEditForm service={service} />
}

function ServiceEditForm({ service }: { service: Service }) {
  const navigate = useNavigate()
  const { mutateAsync: updateService, isPending } = useUpdateService(service.id)
  
  const [formData, setFormData] = useState({
    code: service.code,
    name: service.name,
    defaultUnitPrice: service.defaultUnitPrice,
    unitLabel: service.unitLabel,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateService(formData)
      navigate('/dich-vu')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa dịch vụ</h1>
      </div>
      
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã dịch vụ</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
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
                <Label htmlFor="defaultUnitPrice">Đơn giá (VND)</Label>
                <Input 
                  id="defaultUnitPrice" 
                  type="number" 
                  value={formData.defaultUnitPrice} 
                  onChange={(e) => setFormData({...formData, defaultUnitPrice: Number(e.target.value)})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitLabel">Đơn vị tính</Label>
                <Input 
                  id="unitLabel" 
                  value={formData.unitLabel} 
                  onChange={(e) => setFormData({...formData, unitLabel: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Cập nhật dịch vụ'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
