import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProperty } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Users,
  DoorOpen,
  Wallet,
} from 'lucide-react'

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
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Header */}
      <div className="bg-surface-container-lowest border-surface-border flex items-center gap-4 rounded-2xl border p-6 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-surface-container-low hover:bg-surface-container rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {isEditing ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ mới'}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-body-md text-on-surface-variant">
              {isEditing ? 'Cập nhật thông tin cơ sở kinh doanh của bạn' : 'Thiết lập thông tin cho tòa nhà/cơ sở mới'}
            </p>
            {isEditing && (
              <>
                <span className="text-surface-variant">•</span>
                <span className="font-label-md text-primary">{initialData?.name}</span>
              </>
            )}
          </div>
        </div>
        {isEditing && (
          <Button
            variant="outline"
            className="text-error border-error/50 hover:bg-error/10 hover:text-error bg-error/5 hidden sm:flex"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa nhà trọ
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="bg-status-warning/10 border-status-warning/30 flex items-start gap-4 rounded-2xl border p-4 shadow-sm">
          <div className="bg-status-warning/20 text-status-warning flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-label-lg text-on-surface">Lưu ý khi chỉnh sửa</h4>
            <p className="font-body-md text-on-surface-variant mt-1">
              Thay đổi cấu trúc số tầng sẽ không xóa các phòng hiện có, nhưng có thể ảnh hưởng đến việc hiển thị sơ đồ
              nhà trọ.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row">
        {/* Main Form Area */}
        <div className="flex-1 space-y-6">
          <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-full font-bold">
                  1
                </div>
                <div>
                  <CardTitle className="font-headline-sm text-on-surface">Thông tin cơ bản</CardTitle>
                  <CardDescription className="font-body-sm text-on-surface-variant">
                    Các thông tin chính để định danh nhà trọ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-label-md text-on-surface">
                  Tên tòa nhà / Nhà trọ <span className="text-error">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="text-on-surface-variant absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <Input
                    id="name"
                    placeholder="VD: Chung cư mini Tôn Thất Thuyết"
                    defaultValue={initialData?.name}
                    className="bg-surface border-surface-border focus-visible:ring-primary/20 focus-visible:border-primary h-11 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type" className="font-label-md text-on-surface">
                    Loại hình
                  </Label>
                  <Select defaultValue={initialData?.propertyType || 'ROOM'}>
                    <SelectTrigger id="type" className="bg-surface border-surface-border h-11 rounded-xl">
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
                  <Label htmlFor="status" className="font-label-md text-on-surface">
                    Trạng thái
                  </Label>
                  <Select defaultValue={initialData?.status || 'ACTIVE'}>
                    <SelectTrigger id="status" className="bg-surface border-surface-border h-11 rounded-xl">
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

              <div className="space-y-2">
                <Label htmlFor="floors" className="font-label-md text-on-surface">
                  Số tầng
                </Label>
                <Input
                  id="floors"
                  type="number"
                  min={1}
                  defaultValue={initialData?.floorsCount || 1}
                  className="bg-surface border-surface-border focus-visible:ring-primary/20 focus-visible:border-primary h-11 w-full rounded-xl sm:w-1/2"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-full font-bold">
                  2
                </div>
                <div>
                  <CardTitle className="font-headline-sm text-on-surface">Vị trí & Địa chỉ</CardTitle>
                  <CardDescription className="font-body-sm text-on-surface-variant">
                    Để dễ dàng quản lý và hiển thị trên bản đồ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="province" className="font-label-md text-on-surface">
                    Tỉnh/Thành phố
                  </Label>
                  <Input id="province" defaultValue={initialData?.province} className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="font-label-md text-on-surface">
                    Quận/Huyện
                  </Label>
                  <Input id="district" defaultValue={initialData?.district} className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward" className="font-label-md text-on-surface">
                    Phường/Xã
                  </Label>
                  <Input id="ward" defaultValue={initialData?.ward} className="h-11 rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="font-label-md text-on-surface">
                  Địa chỉ chi tiết (Số nhà, đường)
                </Label>
                <div className="relative">
                  <MapPin className="text-on-surface-variant absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                  <Input id="address" defaultValue={initialData?.address} className="h-11 rounded-xl pl-10" required />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Stats Area (Only visible in Edit Mode, or placeholder in Create mode) */}
        <div className="w-full space-y-6 lg:w-80">
          {isEditing ? (
            <>
              {/* Stats Panel */}
              <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
                <CardHeader className="border-surface-variant/30 border-b pb-4">
                  <CardTitle className="font-headline-sm text-on-surface">Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-surface-variant/30 divide-y">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="text-tertiary h-5 w-5" />
                        <span className="font-label-md text-on-surface-variant">Tổng số phòng</span>
                      </div>
                      <span className="font-headline-sm text-on-surface">{initialData?.roomsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Users className="text-primary h-5 w-5" />
                        <span className="font-label-md text-on-surface-variant">Đang thuê</span>
                      </div>
                      <span className="font-headline-sm text-on-surface">
                        0 {/* Placeholder for occupied rooms */}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-emerald-600" />
                        <span className="font-label-md text-on-surface-variant">Doanh thu/tháng</span>
                      </div>
                      <span className="font-headline-sm text-on-surface">~120M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image / Map Card Placeholder */}
              <Card className="bg-surface-container-lowest border-surface-border overflow-hidden rounded-2xl shadow-sm">
                <div className="bg-surface-container text-on-surface-variant group relative flex h-40 cursor-pointer flex-col items-center justify-center gap-2">
                  <ImageIcon className="h-8 w-8 opacity-50 transition-opacity group-hover:opacity-100" />
                  <span className="font-label-md">Thêm ảnh bìa</span>
                  <div className="bg-primary/0 group-hover:bg-primary/5 absolute inset-0 transition-colors"></div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="bg-surface-container-lowest border-surface-border flex h-48 items-center justify-center overflow-hidden rounded-2xl border-dashed shadow-sm">
              <div className="space-y-2 p-6 text-center">
                <ImageIcon className="text-surface-variant mx-auto h-8 w-8" />
                <p className="font-body-sm text-on-surface-variant">
                  Sau khi tạo nhà trọ, bạn có thể thêm ảnh và xem thống kê tại đây.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sticky Action Bar */}
        <div className="bg-surface/90 border-surface-border fixed right-0 bottom-0 left-[272px] z-20 flex justify-end gap-4 border-t p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md">
          <Button
            type="button"
            variant="outline"
            className="font-label-md border-surface-border bg-surface hover:bg-surface-container h-11 rounded-full px-6"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            className="font-label-md bg-primary text-on-primary hover:bg-primary/90 h-11 rounded-full px-8 shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thông tin
          </Button>
        </div>
      </form>
    </div>
  )
}
