import { useParams, useNavigate } from 'react-router'
import { useProperty, useRooms } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  DoorOpen, 
  Edit, 
  Plus, 
  Users, 
  Layers,
  ChevronRight
} from 'lucide-react'
import { GoongMap } from '@/shared/components/goong-map'
import type { Room } from '@/features/tenant-app/types'
import { StatusBadge } from '@/components/ui/status-badge'
import { ROOM_STATUS_MAP, PROPERTY_STATUS_MAP } from '@/shared/constants/status-config'
import { formatCurrency } from '@/shared/lib/utils'

/**
 * Trang Chi tiết một Khu trọ / Tòa nhà.
 * Hiển thị thông tin chung, bản đồ vị trí, các chỉ số phòng/người thuê và danh sách các phòng thuộc tòa nhà.
 */
export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: property, isLoading: loadingProperty } = useProperty(Number(id))
  const { data: roomsData, isLoading: loadingRooms } = useRooms({ propertyId: Number(id) })

  if (loadingProperty) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">Đang tải thông tin khu trọ...</span>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Không tìm thấy khu trọ</h2>
          <p className="text-xs text-slate-500 mt-1">Khu trọ có thể đã bị xóa hoặc không thuộc quyền quản lý của bạn.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/khu-tro')} className="text-xs">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay lại danh sách
        </Button>
      </div>
    )
  }

  const rooms = roomsData?.data || []
  const availableRoomsCount = rooms.filter((r) => r.status === 'AVAILABLE').length
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'OCCUPIED').length

  return (
    <div className="space-y-6">
      {/* Header Profile Style Banner */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-28 bg-linear-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-xl bg-white border-4 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-blue-600 bg-slate-50">
                {property.coverImageUrl ? (
                  <img src={property.coverImageUrl} alt={property.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{property.name}</h1>
                  <StatusBadge
                    status={property.status}
                    statusMap={PROPERTY_STATUS_MAP}
                    fallbackLabel={property.status}
                    className="text-xs font-medium"
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{property.addressDetail}, {property.ward}, {property.district}, {property.province}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/khu-tro')}
                className="h-9 px-3 text-xs gap-1 border-slate-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Danh sách</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/khu-tro/${property.id}/chinh-sua`)}
                className="h-9 px-3 text-xs gap-1 border-slate-200"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tổng số phòng</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {property._count?.rooms || rooms.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phòng đang trống</div>
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">
                {availableRoomsCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Phòng đang thuê</div>
              <div className="text-2xl font-bold text-indigo-600 tabular-nums">
                {occupiedRoomsCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Quy mô tầng</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {property._count?.floors || 1} tầng
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Rooms, Map & Details */}
      <Tabs defaultValue="rooms" className="w-full space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-lg">
            <TabsTrigger value="rooms" className="text-xs px-4 py-1.5 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs">
              Danh sách phòng ({rooms.length})
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs px-4 py-1.5 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs">
              Bản đồ vị trí
            </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            onClick={() => navigate(`/quan-ly-phong/tao-moi?propertyId=${property.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 gap-1 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm phòng mới
          </Button>
        </div>

        {/* Tab 1: Rooms Grid */}
        <TabsContent value="rooms" className="m-0 focus-visible:outline-none">
          {loadingRooms ? (
            <div className="flex min-h-[250px] items-center justify-center bg-white rounded-xl border border-slate-200">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : rooms.length === 0 ? (
            <Card className="border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <DoorOpen className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Chưa có phòng nào trong khu trọ</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Bắt đầu thiết lập các phòng cho thuê, xếp tầng và định giá thuê cho từng phòng.
              </p>
              <Button
                size="sm"
                onClick={() => navigate(`/quan-ly-phong/tao-moi?propertyId=${property.id}`)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Tạo phòng đầu tiên
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {rooms.map((room: Room) => (
                <Card
                  key={room.id}
                  className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden group"
                  onClick={() => navigate(`/quan-ly-phong/${room.id}/chi-tiet`)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {room.roomCode}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {room.floor?.name || 'Chưa xếp tầng'}
                        </div>
                      </div>
                      <StatusBadge
                        status={room.status}
                        statusMap={ROOM_STATUS_MAP}
                        fallbackLabel={room.status}
                        className="text-[11px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-3 my-2 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Diện tích</span>
                        <span className="font-semibold text-slate-800 tabular-nums">{room.area} m²</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Giá thuê</span>
                        <span className="font-semibold text-blue-600 tabular-nums">
                          {formatCurrency(room.basePrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{room.status === 'AVAILABLE' ? 'Sẵn sàng đón khách' : 'Đang quản lý'}</span>
                    <span className="text-blue-600 font-medium flex items-center group-hover:translate-x-0.5 transition-transform">
                      Xem <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Map Location */}
        <TabsContent value="map" className="m-0 focus-visible:outline-none">
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Vị trí địa lý</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tọa độ hiển thị trên bản đồ số giúp khách thuê dễ dàng định vị khi tìm phòng
              </p>
            </div>
            {property.latitude !== null && property.latitude !== undefined &&
            property.longitude !== null && property.longitude !== undefined ? (
              <div className="h-96 w-full rounded-lg overflow-hidden border border-slate-200">
                <GoongMap latitude={property.latitude} longitude={property.longitude} className="h-full w-full" />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center p-6">
                <MapPin className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-600 font-medium">Chưa có tọa độ bản đồ</p>
                <p className="text-xs text-slate-400 mt-1">Cập nhật địa chỉ để tự động lấy tọa độ vị trí.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/khu-tro/${property.id}/chinh-sua`)}
                  className="mt-3 text-xs"
                >
                  Cập nhật ngay
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
