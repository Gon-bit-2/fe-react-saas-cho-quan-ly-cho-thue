import { useParams, useNavigate } from 'react-router'
import { useRoom, useProperties } from '@/shared/api/properties'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, MapPin, Building2, Edit, FileText, Image as ImageIcon, Zap, Edit2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: room, isLoading: loadingRoom } = useRoom(Number(id))
  const { data: propertiesData } = useProperties()

  if (loadingRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        <p className="text-slate-500 font-medium">Đang tải thông tin phòng...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">Không tìm thấy thông tin phòng</p>
        <Button variant="outline" onClick={() => navigate('/app/quan-ly-phong/danh-sach')}>
          Quay lại danh sách
        </Button>
      </div>
    )
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tiền cọc</p>
                  <p className="text-xl font-bold text-slate-700">
                    {new Intl.NumberFormat('vi-VN').format(room.depositAmount)}<span className="text-base font-medium text-slate-500 ml-1">đ</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => navigate(`/app/quan-ly-phong/${room.id}/chinh-sua`)}>
                <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 h-14 w-full justify-start px-2 gap-2 rounded-xl shadow-sm overflow-x-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none rounded-lg px-4">
            <FileText className="w-4 h-4 mr-2" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none rounded-lg px-4">
            <ImageIcon className="w-4 h-4 mr-2" /> Hình ảnh
          </TabsTrigger>
          <TabsTrigger value="amenities" className="data-[state=active]:bg-slate-100 data-[state=active]:shadow-none rounded-lg px-4">
            <Zap className="w-4 h-4 mr-2" /> Tiện ích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200 rounded-xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Diện tích</span>
                  <span className="font-semibold text-slate-900">{room.area} m²</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Sức chứa tối đa</span>
                  <span className="font-semibold text-slate-900">{room.maxOccupants} người</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Tầng số</span>
                  <span className="font-semibold text-slate-900">{room.floorId || 'Tầng trệt'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Marketplace</span>
                  <Badge variant={room.marketplaceStatus === 'PUBLISHED' ? 'default' : 'outline'}>
                    {room.marketplaceStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 rounded-xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800">Chi phí cố định</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Giá điện (VND/kWh)</span>
                  <span className="font-semibold text-slate-900">{new Intl.NumberFormat('vi-VN').format(room.electricityPrice)}đ</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Giá nước (VND/khối)</span>
                  <span className="font-semibold text-slate-900">{new Intl.NumberFormat('vi-VN').format(room.waterPrice)}đ</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm border-slate-200 rounded-xl">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg text-slate-800">Thư viện ảnh</CardTitle>
                <CardDescription>Quản lý hình ảnh thực tế của phòng</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ImageIcon className="w-4 h-4 mr-2" /> Thêm ảnh mới
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ImageIcon className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">Chưa có hình ảnh nào</p>
                <p className="text-sm">Bấm "Thêm ảnh mới" để tải lên hình ảnh cho phòng này.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm border-slate-200 rounded-xl">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg text-slate-800">Tiện ích đi kèm</CardTitle>
                <CardDescription>Các trang thiết bị và dịch vụ có sẵn trong phòng</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700">Điều hòa</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700">Máy nước nóng</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700">Tủ lạnh</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700">Máy giặt chung</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
