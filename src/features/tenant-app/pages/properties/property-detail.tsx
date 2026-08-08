import { useParams, useNavigate } from 'react-router'
import { useProperty, useRooms } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  DoorOpen, 
  Edit,
  Plus
} from 'lucide-react'
import type { Room } from '@/features/tenant-app/types'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: property, isLoading: loadingProperty } = useProperty(Number(id))
  const { data: roomsData, isLoading: loadingRooms } = useRooms({ propertyId: Number(id) })

  if (loadingProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  if (!property) return <div>Không tìm thấy nhà trọ.</div>

  const rooms = roomsData?.data || []
  const availableRoomsCount = rooms.filter(r => r.status === 'AVAILABLE').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-emerald-500/10 text-emerald-600">Hoạt động</Badge>
      case 'MAINTENANCE': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Bảo trì</Badge>
      default: return <Badge variant="outline">Đóng cửa</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{property.name}</h2>
              {getStatusBadge(property.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.ward}, {property.district}, {property.province}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/app/properties/${property.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số tầng</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.floorsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.roomsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng trống</CardTitle>
            <DoorOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{availableRoomsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Sẵn sàng cho thuê</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <TabsList>
          <TabsTrigger value="rooms">Danh sách phòng</TabsTrigger>
          <TabsTrigger value="floors">Quản lý tầng</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="pt-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Phòng thuộc nhà trọ</CardTitle>
                <CardDescription>Quản lý tất cả các phòng trong khu vực này</CardDescription>
              </div>
              <Button size="sm" onClick={() => navigate(`/app/rooms/new?propertyId=${property.id}`)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm phòng
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRooms ? (
                <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
              ) : rooms.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Chưa có phòng nào. Hãy thêm phòng mới.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room: Room) => (
                    <div key={room.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg text-primary">{room.roomCode}</div>
                        {room.status === 'AVAILABLE' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600">Trống</Badge>
                        ) : room.status === 'OCCUPIED' ? (
                          <Badge variant="secondary">Đang thuê</Badge>
                        ) : (
                          <Badge variant="outline">Bảo trì</Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 space-y-1 mb-4">
                        <div>Tầng: {room.floor}</div>
                        <div>Diện tích: {room.area}m²</div>
                        <div>Giá: {new Intl.NumberFormat('vi-VN').format(room.basePrice)}đ</div>
                      </div>
                      <Button variant="outline" className="w-full text-xs" onClick={() => navigate(`/app/rooms/${room.id}/edit`)}>
                        Quản lý phòng
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="floors" className="pt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quản lý tầng</CardTitle>
              <CardDescription>Cấu hình và nhóm phòng theo tầng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                Tính năng quản lý sơ đồ tầng đang được phát triển.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
