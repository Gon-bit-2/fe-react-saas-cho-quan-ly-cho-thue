import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProperty } from '@/shared/api/properties'
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

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  
  // Real implementation would use react-hook-form and zod
  const { data: initialData, isLoading } = useProperty(Number(id))
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/app/properties')
    }, 1000)
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ mới'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Cập nhật thông tin cơ sở kinh doanh của bạn' : 'Thiết lập thông tin cho tòa nhà/cơ sở mới'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Các thông tin chính để định danh nhà trọ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên tòa nhà / Nhà trọ <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                placeholder="VD: Chung cư mini Tôn Thất Thuyết" 
                defaultValue={initialData?.name}
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại hình</Label>
                <Select defaultValue={initialData?.propertyType || "ROOM"}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Phòng trọ</SelectItem>
                    <SelectItem value="APARTMENT">Chung cư mini</SelectItem>
                    <SelectItem value="WHOLE_HOUSE">Nhà nguyên căn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select defaultValue={initialData?.status || "ACTIVE"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    <SelectItem value="CLOSED">Đóng cửa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Địa chỉ</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Tỉnh/Thành phố</Label>
                  <Input id="province" defaultValue={initialData?.province} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Quận/Huyện</Label>
                  <Input id="district" defaultValue={initialData?.district} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Input id="ward" defaultValue={initialData?.ward} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ chi tiết (Số nhà, đường)</Label>
                <Input id="address" defaultValue={initialData?.address} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floors">Số tầng</Label>
                <Input 
                  id="floors" 
                  type="number" 
                  min={1} 
                  defaultValue={initialData?.floorsCount || 1} 
                  required 
                />
              </div>
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
            Lưu nhà trọ
          </Button>
        </div>
      </form>
    </div>
  )
}
