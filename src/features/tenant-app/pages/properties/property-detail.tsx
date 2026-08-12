import { useParams, useNavigate } from 'react-router'
import { useProperty, useRooms } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MapPin, Building2, DoorOpen, Edit, Plus, Users, Wallet, Settings2 } from 'lucide-react'
import type { Room } from '@/features/tenant-app/types'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: property, isLoading: loadingProperty } = useProperty(Number(id))
  const { data: roomsData, isLoading: loadingRooms } = useRooms({ propertyId: Number(id) })

  if (loadingProperty) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    )
  }

  if (!property)
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="bg-surface-container text-on-surface-variant flex h-16 w-16 items-center justify-center rounded-full">
          <Building2 className="h-8 w-8" />
        </div>
        <p className="font-body-md text-on-surface-variant">Không tìm thấy nhà trọ.</p>
        <Button variant="outline" onClick={() => navigate('/app/khu-tro')} className="rounded-full">
          Quay lại danh sách
        </Button>
      </div>
    )

  const rooms = roomsData?.data || []
  const availableRoomsCount = rooms.filter((r) => r.status === 'AVAILABLE').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-primary/10 text-primary font-label-sm hover:bg-primary/20 border-none uppercase shadow-none">
            Hoạt động
          </Badge>
        )
      case 'MAINTENANCE':
        return (
          <Badge className="bg-status-warning/10 text-status-warning font-label-sm hover:bg-status-warning/20 border-none uppercase shadow-none">
            Bảo trì
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="text-on-surface-variant border-surface-border font-label-sm uppercase shadow-none"
          >
            Đóng cửa
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Style */}
      <div className="bg-surface-container-lowest border-surface-border overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-primary/5 relative h-32">
          <div className="from-primary/20 absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-50"></div>
        </div>
        <div className="relative flex items-end justify-between px-6 pt-0 pb-6">
          <div className="-mt-10 flex items-end gap-5">
            <div className="bg-surface border-surface text-on-surface-variant bg-surface-container-low flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 shadow-md">
              <Building2 className="h-10 w-10 opacity-30" />
            </div>
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-3">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">{property.name}</h2>
                {getStatusBadge(property.status)}
              </div>
              <p className="font-body-md text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <MapPin className="text-tertiary h-4 w-4 shrink-0" />
                {property.address}, {property.ward}, {property.district}, {property.province}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pb-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/khu-tro')}
              className="bg-surface border-surface-border hover:bg-surface-container rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/app/khu-tro/${property.id}/chinh-sua`)}
              className="bg-surface border-surface-border hover:bg-surface-container font-label-md rounded-full shadow-sm"
            >
              <Edit className="text-on-surface-variant mr-2 h-4 w-4" /> Cập nhật
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-primary-container text-on-primary-container flex h-12 w-12 items-center justify-center rounded-full">
            <DoorOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="font-label-sm text-on-surface-variant mb-1 tracking-wider uppercase">Tổng phòng</div>
            <div className="font-display text-on-surface text-2xl font-bold">{property.roomsCount}</div>
          </div>
        </Card>

        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <DoorOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="font-label-sm text-on-surface-variant mb-1 tracking-wider uppercase">Phòng trống</div>
            <div className="font-display text-2xl font-bold text-emerald-600">{availableRoomsCount}</div>
          </div>
        </Card>

        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-tertiary-container text-on-tertiary-container flex h-12 w-12 items-center justify-center rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="font-label-sm text-on-surface-variant mb-1 tracking-wider uppercase">Người thuê</div>
            <div className="font-display text-on-surface text-2xl font-bold">
              {property.roomsCount - availableRoomsCount}
            </div>
          </div>
        </Card>

        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="bg-error-container text-on-error-container flex h-12 w-12 items-center justify-center rounded-full">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="font-label-sm text-on-surface-variant mb-1 tracking-wider uppercase">Công nợ</div>
            <div className="font-display text-error text-2xl font-bold">0</div>
          </div>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="bg-surface-container-lowest border-surface-border mb-4 inline-flex h-12 w-auto rounded-xl border p-1 shadow-sm">
          <TabsTrigger
            value="rooms"
            className="font-label-md data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container rounded-lg px-6 transition-all"
          >
            Danh sách phòng
          </TabsTrigger>
          <TabsTrigger
            value="floors"
            className="font-label-md data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container rounded-lg px-6 transition-all"
          >
            Sơ đồ tầng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="m-0 focus-visible:outline-none">
          <Card className="bg-surface-container-lowest border-surface-border overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 bg-surface-container-low/30 flex flex-row items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <DoorOpen className="h-4 w-4" />
                </div>
                <CardTitle className="font-headline-sm text-on-surface">Quản lý các phòng</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/app/quan-ly-phong/tao-moi?propertyId=${property.id}`)}
                className="bg-primary text-on-primary hover:bg-primary/90 font-label-md h-9 rounded-full shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {loadingRooms ? (
                <div className="flex items-center justify-center py-12">
                  <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="border-surface-border bg-surface flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 text-center">
                  <DoorOpen className="text-surface-variant mb-4 h-12 w-12" />
                  <h3 className="font-headline-sm text-on-surface mb-2">Chưa có phòng nào</h3>
                  <p className="font-body-md text-on-surface-variant mb-4">
                    Hãy bắt đầu bằng cách thêm các phòng cho nhà trọ của bạn.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/app/quan-ly-phong/tao-moi?propertyId=${property.id}`)}
                    className="font-label-md border-surface-border text-primary hover:bg-primary/5 rounded-full"
                  >
                    Thêm phòng ngay
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rooms.map((room: Room) => (
                    <div
                      key={room.id}
                      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                        room.status === 'AVAILABLE'
                          ? 'bg-surface border-emerald-500/20 hover:border-emerald-500/50'
                          : room.status === 'OCCUPIED'
                            ? 'bg-surface border-surface-border hover:border-primary/50'
                            : 'bg-surface-container-low border-surface-variant hover:border-surface-variant/80'
                      } `}
                      onClick={() => navigate(`/app/quan-ly-phong/${room.id}/chinh-sua`)}
                    >
                      {/* Top banner color strip based on status */}
                      <div
                        className={`absolute top-0 right-0 left-0 h-1.5 ${
                          room.status === 'AVAILABLE'
                            ? 'bg-emerald-500'
                            : room.status === 'OCCUPIED'
                              ? 'bg-primary'
                              : 'bg-status-warning'
                        }`}
                      ></div>

                      <div className="mt-1 mb-4 flex items-start justify-between">
                        <div>
                          <div className="font-display text-on-surface group-hover:text-primary text-2xl leading-none font-bold transition-colors">
                            {room.roomCode}
                          </div>
                          <div className="font-label-md text-on-surface-variant mt-1">Tầng {room.floor}</div>
                        </div>
                        {room.status === 'AVAILABLE' ? (
                          <Badge className="font-label-sm border-none bg-emerald-500/10 text-emerald-600 shadow-none hover:bg-emerald-500/20">
                            Trống
                          </Badge>
                        ) : room.status === 'OCCUPIED' ? (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-label-sm border-none shadow-none">
                            Đang thuê
                          </Badge>
                        ) : (
                          <Badge className="bg-status-warning/10 text-status-warning hover:bg-status-warning/20 font-label-sm border-none shadow-none">
                            Bảo trì
                          </Badge>
                        )}
                      </div>

                      <div className="border-surface-border text-on-surface-variant mb-4 flex items-center gap-4 border-y py-3">
                        <div className="flex flex-1 flex-col">
                          <span className="font-label-sm mb-0.5 text-[10px] tracking-wider uppercase">Diện tích</span>
                          <span className="font-body-md text-on-surface">{room.area}m²</span>
                        </div>
                        <div className="bg-surface-border h-8 w-px"></div>
                        <div className="flex flex-1 flex-col">
                          <span className="font-label-sm mb-0.5 text-[10px] tracking-wider uppercase">Giá/tháng</span>
                          <span className="font-body-md text-on-surface font-medium">
                            {new Intl.NumberFormat('vi-VN').format(room.basePrice / 1000)}k
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center -space-x-2">
                          {/* Fake avatars for occupied rooms */}
                          {room.status === 'OCCUPIED' && (
                            <>
                              <div className="bg-primary-container text-on-primary-container border-surface font-label-sm z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs">
                                L
                              </div>
                              <div className="bg-tertiary-container text-on-tertiary-container border-surface font-label-sm z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs">
                                T
                              </div>
                            </>
                          )}
                          {room.status === 'AVAILABLE' && (
                            <span className="font-label-sm text-emerald-600">Sẵn sàng dọn vào</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary h-8 w-8 rounded-full opacity-0 transition-all group-hover:opacity-100"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="floors" className="m-0 focus-visible:outline-none">
          <Card className="bg-surface-container-lowest border-surface-border flex h-64 flex-col items-center justify-center rounded-2xl shadow-sm">
            <Settings2 className="text-surface-variant mb-4 h-10 w-10" />
            <h3 className="font-headline-sm text-on-surface mb-2">Chế độ sơ đồ tầng</h3>
            <p className="font-body-md text-on-surface-variant">
              Tính năng hiển thị trực quan sơ đồ các phòng đang được phát triển.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
