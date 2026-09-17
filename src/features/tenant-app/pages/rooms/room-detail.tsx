import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit,
  FileText,
  Image as ImageIcon,
  MapPin,
  Zap,
  Send,
  Trash2,
  Star,
  Loader2,
  Settings,
} from 'lucide-react'
import {
  useRoom,
  useUpdateRoomMarketplace,
  useUploadRoomImages,
  useDeleteRoomImage,
  useUpdateRoomImage,
  useAmenities,
  useReplaceRoomAmenities,
} from '@/shared/api/properties'
import { RoomServices } from './components/room-services'
import { RoomAssets } from './components/room-assets'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { MARKETPLACE_STATUS_MAP, ROOM_STATUS_MAP } from '@/shared/constants/status-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/shared/lib/utils'

/**
 * Trang chi tiết phòng dành cho chủ trọ
 * Hiển thị thông số diện tích, giá cả, ảnh thực tế, tiện ích, dịch vụ và tài sản đi kèm
 */
export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: room, isLoading } = useRoom(Number(id))
  const updateMarketplace = useUpdateRoomMarketplace(Number(id))

  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadImages = useUploadRoomImages(Number(id))
  const deleteImage = useDeleteRoomImage(Number(id))
  const updateImage = useUpdateRoomImage(Number(id))

  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])

  const { data: allAmenitiesData } = useAmenities({ isActive: true, limit: 100 })
  const allAmenities = allAmenitiesData?.data || []
  const replaceAmenities = useReplaceRoomAmenities(Number(id))

  /**
   * Mở modal chỉnh sửa tiện ích và nạp danh sách tiện ích đang có của phòng
   */
  const handleOpenAmenities = () => {
    if (room?.amenities) {
      setSelectedAmenities(room.amenities.map((a) => a.amenity.id))
    }
    setIsAmenitiesOpen(true)
  }

  /**
   * Lưu danh sách tiện ích đã chọn cho phòng
   */
  const handleSaveAmenities = async () => {
    try {
      await replaceAmenities.mutateAsync(selectedAmenities)
      toast.success('Đã cập nhật tiện ích phòng thành công!')
      setIsAmenitiesOpen(false)
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật tiện ích!')
    }
  }

  /**
   * Xử lý tải lên các tệp hình ảnh mới cho phòng
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    const files = Array.from(e.target.files)
    try {
      await uploadImages.mutateAsync(files)
      toast.success('Tải ảnh lên thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi tải ảnh!')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chi tiết phòng {room.title}</h1>
            {room.status && (
              <StatusBadge status={room.status} statusMap={ROOM_STATUS_MAP} fallbackLabel={room.status} />
            )}
          </div>
          <p className="text-sm text-slate-500">Mã phòng: <span className="font-semibold text-slate-700">{room.roomCode}</span></p>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 border border-blue-100">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{room.title}</h2>
                <StatusBadge
                  status={room.marketplaceStatus as string}
                  statusMap={MARKETPLACE_STATUS_MAP}
                  fallbackLabel={room.marketplaceStatus}
                />
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-slate-400" /> {room.property?.name || 'Chưa gắn với tòa nhà'}
                {room.property?.addressDetail && ` • ${room.property.addressDetail}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giá thuê phòng</p>
              <p className="text-xl font-bold text-emerald-600 tabular-nums">
                {formatCurrency(room.basePrice)}
                <span className="ml-1 text-sm font-normal text-slate-500">/tháng</span>
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiền cọc</p>
              <p className="text-xl font-semibold text-slate-800 tabular-nums">
                {formatCurrency(room.depositAmount ?? 0)}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Button variant="outline" onClick={() => navigate(`/quan-ly-phong/${room.id}/chinh-sua`)}>
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Button>
              {['DRAFT', 'HIDDEN', 'REJECTED'].includes(room.marketplaceStatus as string) && (
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
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Send className="mr-2 h-4 w-4" /> Gửi kiểm duyệt
                </Button>
              )}
              {room.marketplaceStatus === 'PUBLISHED' && (
                <Button
                  onClick={async () => {
                    try {
                      await updateMarketplace.mutateAsync('HIDDEN')
                      toast.success('Đã ẩn phòng khỏi sàn thành công!')
                    } catch {
                      toast.error('Có lỗi xảy ra khi ẩn phòng')
                    }
                  }}
                  disabled={updateMarketplace.isPending}
                  variant="destructive"
                >
                  Ẩn khỏi sàn
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-12 w-full justify-start gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100/60 p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <FileText className="mr-2 h-4 w-4" /> Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" /> Hình ảnh ({room.images?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="amenities"
            className="rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <Zap className="mr-2 h-4 w-4" /> Tiện ích ({amenities.length})
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <Settings className="mr-2 h-4 w-4" /> Dịch vụ
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <Settings className="mr-2 h-4 w-4" /> Tài sản
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Thông số phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Diện tích</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{room.area ?? '—'} m²</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Sức chứa tối đa</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{room.maxOccupants} người</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Tầng số</span>
                  <span className="font-semibold text-slate-900">
                    {room.floor?.name || (room.floorId ? `Tầng ${room.floorId}` : 'Tầng trệt')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Trạng thái thuê</span>
                  <StatusBadge status={room.status} statusMap={ROOM_STATUS_MAP} fallbackLabel={room.status} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Marketplace</span>
                  <StatusBadge status={room.marketplaceStatus as string} statusMap={MARKETPLACE_STATUS_MAP} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Chi phí cố định định kỳ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Giá thuê gốc</span>
                  <span className="font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(room.basePrice)}/tháng
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Tiền đặt cọc</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(room.depositAmount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 py-2">
                  <span className="text-slate-500">Giá điện</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(room.electricityPrice ?? 0)}/kWh
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Giá nước</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(room.waterPrice ?? 0)}/khối
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {room.description && (
            <Card className="mt-6 rounded-xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Mô tả chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {room.description}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg text-slate-800">Thư viện ảnh</CardTitle>
                <CardDescription>Quản lý hình ảnh thực tế của phòng</CardDescription>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadImages.isPending}
              >
                {uploadImages.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Thêm ảnh mới
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {!room.images?.length ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-slate-400">
                  <ImageIcon className="mb-3 h-12 w-12 text-slate-300" />
                  <p className="font-medium text-slate-600">Chưa có hình ảnh nào</p>
                  <p className="text-sm">Bấm "Thêm ảnh mới" để tải lên hình ảnh cho phòng này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {room.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Room image'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Top badges */}
                      {img.isThumbnail && (
                        <div className="absolute top-2 left-2 rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                          Ảnh bìa
                        </div>
                      )}

                      {/* Overlay actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                        {!img.isThumbnail && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-emerald-600"
                            title="Đặt làm ảnh bìa"
                            onClick={() => updateImage.mutate({ imageId: img.id, data: { isThumbnail: true } })}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          title="Xóa ảnh"
                          onClick={() => deleteImage.mutate(img.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <Dialog open={isAmenitiesOpen} onOpenChange={setIsAmenitiesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleOpenAmenities}>
                    <Edit className="mr-2 h-4 w-4" /> Quản lý tiện ích
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Quản lý tiện ích phòng</DialogTitle>
                    <DialogDescription>Chọn các tiện ích đi kèm với phòng này</DialogDescription>
                  </DialogHeader>
                  <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto py-4">
                    {allAmenities.map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity.id)
                      return (
                        <div
                          key={amenity.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAmenities(selectedAmenities.filter((id) => id !== amenity.id))
                            } else {
                              setSelectedAmenities([...selectedAmenities, amenity.id])
                            }
                          }}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className={isSelected ? 'font-medium text-emerald-900' : 'text-slate-600'}>
                            {amenity.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAmenitiesOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSaveAmenities} disabled={replaceAmenities.isPending}>
                      {replaceAmenities.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-6">
              {amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {amenities.map(({ amenity }) => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-slate-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 italic">Chưa có thông tin tiện ích.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RoomServices roomId={Number(id)} />
        </TabsContent>

        <TabsContent value="assets" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RoomAssets roomId={Number(id)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
