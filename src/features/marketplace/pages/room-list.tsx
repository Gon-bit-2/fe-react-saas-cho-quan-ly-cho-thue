import { useSearchParams } from 'react-router'
import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, RotateCcw, Crosshair, AlertCircle } from 'lucide-react'
import { useMarketplaceRooms } from '@/shared/api/marketplace'
import { RoomCard } from '../components/room-card'
import { AdministrativeAreaSelect } from '@/shared/components/administrative-area-select'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/**
 * Trang danh sách phòng / Tìm kiếm phòng trọ - Marketplace.
 * Tích hợp Filter Sidebar trên Desktop và Filter Drawer (Sheet) trên Mobile theo DESIGN.md.
 */
export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Local state lưu trữ các giá trị lọc
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    provinceCode: searchParams.get('provinceCode') || '',
    wardCode: searchParams.get('wardCode') || '',
    propertyType: searchParams.get('propertyType') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radius: searchParams.get('radius') || '3',
  })

  // Định dạng tham số query gửi tới Backend API
  const apiFilters: Record<string, string | number> = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  }

  if (filters.search) apiFilters.search = filters.search
  if (filters.provinceCode) apiFilters.provinceCode = filters.provinceCode
  if (filters.wardCode) apiFilters.wardCode = filters.wardCode
  if (filters.propertyType && filters.propertyType !== 'all') apiFilters.propertyType = filters.propertyType
  if (filters.priceRange && filters.priceRange !== 'all') {
    if (filters.priceRange === 'under-3m') apiFilters.maxPrice = 3000000
    if (filters.priceRange === '3m-5m') {
      apiFilters.minPrice = 3000000
      apiFilters.maxPrice = 5000000
    }
    if (filters.priceRange === '5m-10m') {
      apiFilters.minPrice = 5000000
      apiFilters.maxPrice = 10000000
    }
    if (filters.priceRange === 'over-10m') apiFilters.minPrice = 10000000
  }
  if (filters.lat && filters.lng) {
    apiFilters.lat = Number(filters.lat)
    apiFilters.lng = Number(filters.lng)
    apiFilters.radius = Number(filters.radius) || 3
  }

  const { data, isLoading } = useMarketplaceRooms(apiFilters)
  const rooms = data?.data || []

  /**
   * Áp dụng bộ lọc và đồng bộ URL query params
   */
  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.provinceCode) params.set('provinceCode', filters.provinceCode)
    if (filters.wardCode) params.set('wardCode', filters.wardCode)
    if (filters.propertyType && filters.propertyType !== 'all') params.set('propertyType', filters.propertyType)
    if (filters.priceRange && filters.priceRange !== 'all') params.set('priceRange', filters.priceRange)
    if (filters.lat) params.set('lat', filters.lat)
    if (filters.lng) params.set('lng', filters.lng)
    if (filters.radius) params.set('radius', filters.radius)

    setSearchParams(params)
    setMobileFilterOpen(false)
  }

  /**
   * Đặt lại toàn bộ bộ lọc về trạng thái ban đầu
   */
  const handleResetFilters = () => {
    setFilters({
      search: '',
      provinceCode: '',
      wardCode: '',
      propertyType: 'all',
      priceRange: 'all',
      lat: '',
      lng: '',
      radius: '3',
    })
    setSearchParams(new URLSearchParams())
    setMobileFilterOpen(false)
  }

  /**
   * Lấy tọa độ địa lý hiện tại của người dùng qua Geolocation API
   */
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị')
      return
    }
    const toastId = toast.loading('Đang lấy vị trí hiện tại...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(toastId)
        setFilters((f) => ({
          ...f,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
          provinceCode: '',
          wardCode: '',
        }))
        toast.success('Đã nhận diện vị trí của bạn!')
      },
      (err) => {
        console.error('Lỗi định vị:', err)
        toast.dismiss(toastId)
        toast.error('Không thể lấy vị trí hiện tại.')
      },
      { timeout: 10000 }
    )
  }

  /**
   * Hủy kích hoạt chế độ tìm quanh đây
   */
  const clearLocation = () => {
    setFilters((f) => ({ ...f, lat: '', lng: '' }))
  }

  /**
   * Render nội dung form lọc dùng chung cho cả Sidebar desktop và Drawer mobile
   */
  const renderFilterFields = () => (
    <div className="space-y-5">
      {/* Tìm kiếm từ khóa */}
      <div>
        <label className="font-label-md text-foreground mb-1.5 block text-sm font-medium">Tìm kiếm</label>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4" />
          <Input
            type="text"
            placeholder="Nhập tên khu vực, tên phòng..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Khu vực & Vị trí */}
      <div>
        <label className="font-label-md text-foreground mb-1.5 block text-sm font-medium">Khu vực</label>

        {filters.lat ? (
          <div className="bg-primary/5 border border-primary/20 relative rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <Crosshair className="text-primary size-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">Đang dùng vị trí hiện tại</p>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-xs text-muted-foreground hover:text-destructive mt-1 underline"
                >
                  Bỏ chọn vị trí
                </button>
              </div>
            </div>

            <div className="border-primary/15 mt-3 border-t pt-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Bán kính quét</label>
              <Select
                value={filters.radius}
                onValueChange={(val) => setFilters((f) => ({ ...f, radius: val }))}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Chọn bán kính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 km</SelectItem>
                  <SelectItem value="3">3 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleFindNearMe}
              className="w-full justify-center gap-2 h-10 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Crosshair className="size-4" />
              Tìm quanh đây
            </Button>

            {/* Quick city tags */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { code: '01', name: 'Hà Nội' },
                { code: '79', name: 'TP. HCM' },
                { code: '48', name: 'Đà Nẵng' },
              ].map((city) => {
                const isActive = filters.provinceCode === city.code
                return (
                  <Badge
                    key={city.code}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => {
                      const newCode = isActive ? '' : city.code
                      setFilters((prev) => ({
                        ...prev,
                        provinceCode: newCode,
                        wardCode: '',
                        lat: '',
                        lng: '',
                      }))
                    }}
                    className="cursor-pointer px-2.5 py-1 text-xs hover:opacity-85 transition-opacity"
                  >
                    <MapPin className="size-3 mr-1" />
                    {city.name}
                  </Badge>
                )
              })}
            </div>

            <AdministrativeAreaSelect
              provinceCode={filters.provinceCode}
              wardCode={filters.wardCode}
              onChange={(area) => setFilters((current) => ({ ...current, ...area }))}
            />
          </div>
        )}
      </div>

      {/* Loại hình bất động sản */}
      <div>
        <label className="font-label-md text-foreground mb-1.5 block text-sm font-medium">Loại hình</label>
        <Select
          value={filters.propertyType}
          onValueChange={(val) => setFilters((f) => ({ ...f, propertyType: val }))}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Tất cả loại hình" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="HOUSE">Nhà nguyên căn</SelectItem>
            <SelectItem value="MINI_APARTMENT">Chung cư mini</SelectItem>
            <SelectItem value="APARTMENT">Căn hộ chung cư</SelectItem>
            <SelectItem value="DORM">Ký túc xá / Sleepbox</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mức giá */}
      <div>
        <label className="font-label-md text-foreground mb-1.5 block text-sm font-medium">Mức giá</label>
        <Select
          value={filters.priceRange}
          onValueChange={(val) => setFilters((f) => ({ ...f, priceRange: val }))}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Tất cả mức giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức giá</SelectItem>
            <SelectItem value="under-3m">Dưới 3 triệu</SelectItem>
            <SelectItem value="3m-5m">3 - 5 triệu</SelectItem>
            <SelectItem value="5m-10m">5 - 10 triệu</SelectItem>
            <SelectItem value="over-10m">Trên 10 triệu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hành động */}
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={handleApplyFilters} className="w-full h-10 font-medium">
          Áp dụng bộ lọc
        </Button>
        <Button
          variant="ghost"
          onClick={handleResetFilters}
          className="w-full h-9 text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  )

  return (
    <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto flex max-w-[1440px] flex-col gap-8 py-8 md:flex-row">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden md:block w-72 flex-shrink-0">
        <Card className="sticky top-[calc(var(--spacing-topbar-height)+24px)] rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <SlidersHorizontal className="size-4 text-primary" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">{renderFilterFields()}</CardContent>
        </Card>
      </aside>

      {/* Results Section */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Kết quả tìm kiếm</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isLoading ? 'Đang tìm kiếm dữ liệu...' : `Tìm thấy ${rooms.length} phòng cho thuê`}
            </p>
          </div>

          {/* Nút lọc cho thiết bị di động (Mobile Filter Drawer) */}
          <div className="block md:hidden">
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2 justify-center border-slate-300">
                  <SlidersHorizontal className="size-4 text-primary" />
                  Bộ lọc & Tìm kiếm
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto">
                <SheetHeader className="text-left pb-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-primary" />
                    Bộ lọc phòng
                  </SheetTitle>
                  <SheetDescription>Tùy chỉnh tiêu chí để tìm phòng ưng ý nhất.</SheetDescription>
                </SheetHeader>
                <div className="py-4">{renderFilterFields()}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-2 border-slate-200 py-16 text-center bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <AlertCircle className="size-6 text-slate-400" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">Không tìm thấy phòng nào</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-5">
                Không có phòng nào thỏa mãn các tiêu chí lọc hiện tại. Hãy thử nới rộng khoảng giá hoặc chọn khu vực khác.
              </p>
              <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                <RotateCcw className="size-4" />
                Xóa tất cả bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
