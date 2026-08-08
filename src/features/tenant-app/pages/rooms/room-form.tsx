import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useRoom, useProperties } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

export function Component() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const defaultPropertyId = searchParams.get('propertyId')
  const navigate = useNavigate()
  const isEditing = !!id
  
  const { data: initialData, isLoading: loadingRoom } = useRoom(Number(id))
  const { data: propertiesData, isLoading: loadingProps } = useProperties()
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/app/rooms')
    }, 1000)
  }

  if ((isEditing && loadingRoom) || loadingProps) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  const properties = propertiesData?.data || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Cập nhật thông tin chi tiết của phòng' : 'Khởi tạo phòng mới để đưa vào hoạt động'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Mã phòng, tòa nhà và trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Nhà trọ / Tòa nhà <span className="text-destructive">*</span></Label>
                <Select defaultValue={initialData?.propertyId?.toString() || defaultPropertyId || undefined} required>
                  <SelectTrigger id="propertyId">
                    <SelectValue placeholder="Chọn nhà trọ" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p: Property) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomCode">Mã phòng <span className="text-destructive">*</span></Label>
                <Input 
                  id="roomCode" 
                  placeholder="VD: 101, A2, P.05" 
                  defaultValue={initialData?.roomCode}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng số</Label>
                <Input 
                  id="floor" 
                  type="number" 
                  defaultValue={initialData?.floor || 1} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái hiện tại</Label>
                <Select defaultValue={initialData?.status || "AVAILABLE"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Phòng trống (Sẵn sàng thuê)</SelectItem>
                    <SelectItem value="OCCUPIED">Đang cho thuê</SelectItem>
                    <SelectItem value="MAINTENANCE">Đang bảo trì/Sửa chữa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader>
            <CardTitle>Thông tin kinh doanh</CardTitle>
            <CardDescription>Giá, diện tích và giới hạn người ở</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Giá thuê (VND/tháng) <span className="text-destructive">*</span></Label>
                <Input 
                  id="basePrice" 
                  type="number" 
                  min={0}
                  step={100000}
                  defaultValue={initialData?.basePrice} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Diện tích (m²)</Label>
                <Input 
                  id="area" 
                  type="number" 
                  min={1}
                  defaultValue={initialData?.area} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOccupants">Số người tối đa</Label>
                <Input 
                  id="maxOccupants" 
                  type="number" 
                  min={1}
                  defaultValue={initialData?.maxOccupants} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select defaultValue={initialData?.marketplaceStatus || "UNPUBLISHED"}>
                <SelectTrigger id="marketplace">
                  <SelectValue placeholder="Trạng thái đăng tin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPUBLISHED">Không đăng lên Marketplace</SelectItem>
                  <SelectItem value="PUBLISHED">Đang đăng tin tìm khách (Published)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            <Save className="mr-2 h-4 w-4" />
            Lưu phòng
          </Button>
        </div>
      </form>
    </div>
  )
}
