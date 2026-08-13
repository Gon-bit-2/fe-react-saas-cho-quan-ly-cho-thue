import { useNavigate, useParams } from 'react-router'
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Edit, FileText, Image as ImageIcon, MapPin, Zap, Send } from 'lucide-react'
import { useRoom, useUpdateRoomMarketplace } from '@/shared/api/properties'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: room, isLoading } = useRoom(Number(id))
  const updateMarketplace = useUpdateRoomMarketplace(Number(id))

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        <p className="font-medium text-slate-500">Đang tải thông tin phòng...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-slate-300" />
        <p className="font-medium text-slate-500">Không tìm thấy thông tin phòng</p>
        <Button variant="outline" onClick={() => navigate('/quan-ly-phong/danh-sach')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const amenities = room.amenities ?? []

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết phòng {room.title}</h1>
          <p className="text-slate-500">Thông tin chi tiết về phòng và các cấu hình liên quan</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{room.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-slate-500">
                <MapPin className="h-4 w-4" /> {room.property?.name || 'Chưa gắn với tòa nhà'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Giá phòng</p>
              <p className="text-xl font-bold text-primary">
                {new Intl.NumberFormat('vi-VN').format(room.basePrice)}
                <span className="ml-1 text-base font-medium">đ/tháng</span>
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="text-sm font-medium text-slate-500">Tiền cọc</p>
              <p className="text-xl font-bold text-slate-700">
                {new Intl.NumberFormat('vi-VN').format(room.depositAmount ?? 0)}
                <span className="ml-1 text-base font-medium text-slate-500">đ</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/quan-ly-phong/${room.id}/chinh-sua`)}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </Button>
            {room.marketplaceStatus === 'DRAFT' && (
              <Button 
                onClick={async () => {
                  try {
                    await updateMarketplace.mutateAsync('PENDING_REVIEW')
                    toast.success('Đã gửi yêu cầu xét duyệt thành công!')
                  } catch {
                    toast.error('Có lỗi xảy ra khi gửi yêu cầu')
                  }
                }}
                disabled={updateMarketplace.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="mr-2 h-4 w-4" /> Gửi kiểm duyệt
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-14 w-full justify-start gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
          <TabsTrigger value="overview" className="rounded-lg px-4 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <FileText className="mr-2 h-4 w-4" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-lg px-4 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <ImageIcon className="mr-2 h-4 w-4" /> Hình ảnh
          </TabsTrigger>
          <TabsTrigger value="amenities" className="rounded-lg px-4 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <Zap className="mr-2 h-4 w-4" /> Tiện ích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Diện tích</span>
                  <span className="font-semibold text-slate-900">{room.area ?? '—'} m²</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Sức chứa tối đa</span>
                  <span className="font-semibold text-slate-900">{room.maxOccupants} người</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Tầng số</span>
                  <span className="font-semibold text-slate-900">{room.floorId || 'Tầng trệt'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Marketplace</span>
                  <Badge variant={
                    room.marketplaceStatus === 'PUBLISHED' ? 'default' : 
                    room.marketplaceStatus === 'REJECTED' ? 'destructive' : 
                    room.marketplaceStatus === 'PENDING_REVIEW' ? 'secondary' : 'outline'
                  }>
                    {room.marketplaceStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Chi phí cố định</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Giá điện (VND/kWh)</span>
                  <span className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN').format(room.electricityPrice ?? 0)}đ
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Giá nước (VND/khối)</span>
                  <span className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('vi-VN').format(room.waterPrice ?? 0)}đ
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg text-slate-800">Thư viện ảnh</CardTitle>
                <CardDescription>Quản lý hình ảnh thực tế của phòng</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" /> Thêm ảnh mới
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-slate-400">
                <ImageIcon className="mb-3 h-12 w-12 text-slate-300" />
                <p className="font-medium text-slate-600">Chưa có hình ảnh nào</p>
                <p className="text-sm">Bấm "Thêm ảnh mới" để tải lên hình ảnh cho phòng này.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg text-slate-800">Tiện ích đi kèm</CardTitle>
                <CardDescription>Các trang thiết bị và dịch vụ có sẵn trong phòng</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {amenities.map(({ amenity }) => (
                    <div key={amenity.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-slate-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center italic text-slate-500">Chưa có thông tin tiện ích.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
