import { useSearchParams } from 'react-router'
import { useState } from 'react'
import { useMarketplaceRooms } from '@/shared/api/marketplace'
import { RoomCard } from '../components/room-card'
import { AdministrativeAreaSelect } from '@/shared/components/administrative-area-select'
import { toast } from 'sonner'

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Local state for filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    provinceCode: searchParams.get('provinceCode') || '',
    wardCode: searchParams.get('wardCode') || '',
    propertyType: searchParams.get('propertyType') || '',
    priceRange: searchParams.get('priceRange') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
    radius: searchParams.get('radius') || '3',
  })

  // Parse filters for API
  const apiFilters: Record<string, string | number> = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  }

  if (filters.search) apiFilters.search = filters.search
  if (filters.provinceCode) apiFilters.provinceCode = filters.provinceCode
  if (filters.wardCode) apiFilters.wardCode = filters.wardCode
  if (filters.propertyType) apiFilters.propertyType = filters.propertyType
  if (filters.priceRange) {
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

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.provinceCode) params.set('provinceCode', filters.provinceCode)
    if (filters.wardCode) params.set('wardCode', filters.wardCode)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    if (filters.priceRange) params.set('priceRange', filters.priceRange)
    if (filters.lat) params.set('lat', filters.lat)
    if (filters.lng) params.set('lng', filters.lng)
    if (filters.radius) params.set('radius', filters.radius)

    setSearchParams(params)
  }

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
          provinceCode: '', // clear text area if using location
          wardCode: '',
        }))
      },
      (err) => {
        console.error('Lỗi định vị:', err)
        toast.dismiss(toastId)
      },
      { timeout: 10000 }
    )
  }

  const clearLocation = () => {
    setFilters((f) => ({ ...f, lat: '', lng: '' }))
  }

  return (
    <div className="px-page-padding-mobile md:px-page-padding-desktop mx-auto flex max-w-[1440px] flex-col gap-8 py-8 md:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full flex-shrink-0 md:w-64">
        <div className="bg-surface-container-lowest border-surface-border sticky top-[calc(var(--spacing-topbar-height)+24px)] rounded-xl border p-4">
          <h2 className="font-headline-sm text-text-main mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">filter_list</span>
            Bộ lọc
          </h2>

          <div className="space-y-6">
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Tìm kiếm</label>
              <div className="relative">
                <span className="material-symbols-outlined text-on-surface-variant pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Nhập tên khu vực, tên phòng..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="bg-surface-container-lowest border-surface-border focus:border-primary font-body-md text-on-surface flex h-10 w-full rounded-lg border px-10 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Khu vực</label>

              {filters.lat ? (
                <div className="bg-primary/5 border-primary/20 relative rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">my_location</span>
                    <div>
                      <p className="font-label-sm text-primary">Đang dùng vị trí hiện tại</p>
                      <button
                        onClick={clearLocation}
                        className="text-on-surface-variant hover:text-error mt-1 text-xs underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                  <div className="border-primary/10 mt-3 border-t pt-3">
                    <label className="font-label-sm text-on-surface-variant mb-1 block">Bán kính tìm kiếm</label>
                    <div className="relative">
                      <select
                        className="bg-surface-container-lowest border-surface-border focus:border-primary font-body-sm text-on-surface h-8 w-full cursor-pointer appearance-none rounded border pr-8 pl-2 outline-none"
                        value={filters.radius}
                        onChange={(e) => setFilters((f) => ({ ...f, radius: e.target.value }))}
                      >
                        <option value="1">1 km</option>
                        <option value="3">3 km</option>
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                      </select>
                      <span className="material-symbols-outlined text-on-surface-variant pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[16px]">
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleFindNearMe}
                    className="bg-surface border-surface-border hover:bg-surface-container font-label-md text-primary mb-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    Tìm quanh đây
                  </button>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => {
                        const newCode = filters.provinceCode === '01' ? '' : '01';
                        const newFilters = { ...filters, provinceCode: newCode, wardCode: '', lat: '', lng: '' };
                        setFilters(newFilters);
                        const params = new URLSearchParams(searchParams);
                        if (newCode) params.set('provinceCode', newCode);
                        else params.delete('provinceCode');
                        params.delete('wardCode');
                        params.delete('lat');
                        params.delete('lng');
                        setSearchParams(params);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.provinceCode === '01' ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
                    >
                      Hà Nội
                    </button>
                    <button
                      onClick={() => {
                        const newCode = filters.provinceCode === '79' ? '' : '79';
                        const newFilters = { ...filters, provinceCode: newCode, wardCode: '', lat: '', lng: '' };
                        setFilters(newFilters);
                        const params = new URLSearchParams(searchParams);
                        if (newCode) params.set('provinceCode', newCode);
                        else params.delete('provinceCode');
                        params.delete('wardCode');
                        params.delete('lat');
                        params.delete('lng');
                        setSearchParams(params);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.provinceCode === '79' ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
                    >
                      Hồ Chí Minh
                    </button>
                    <button
                      onClick={() => {
                        const newCode = filters.provinceCode === '48' ? '' : '48';
                        const newFilters = { ...filters, provinceCode: newCode, wardCode: '', lat: '', lng: '' };
                        setFilters(newFilters);
                        const params = new URLSearchParams(searchParams);
                        if (newCode) params.set('provinceCode', newCode);
                        else params.delete('provinceCode');
                        params.delete('wardCode');
                        params.delete('lat');
                        params.delete('lng');
                        setSearchParams(params);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.provinceCode === '48' ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}`}
                    >
                      Đà Nẵng
                    </button>
                  </div>
                  <AdministrativeAreaSelect
                    provinceCode={filters.provinceCode}
                    wardCode={filters.wardCode}
                    onChange={(area) => setFilters((current) => ({ ...current, ...area }))}
                  />
                </>
              )}
            </div>

            <div>
              <label className="font-label-md text-on-surface mb-2 block">Loại hình</label>
              <div className="relative">
                <select
                  className="bg-surface-container-lowest border-surface-border focus:border-primary font-body-md text-on-surface h-10 w-full cursor-pointer appearance-none rounded-lg border pr-10 pl-3 transition-colors outline-none"
                  value={filters.propertyType}
                  onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))}
                >
                  <option value="">Tất cả</option>
                  <option value="HOUSE">Nhà nguyên căn</option>
                  <option value="MINI_APARTMENT">Chung cư mini</option>
                  <option value="APARTMENT">Chung cư</option>
                  <option value="DORM">Ký túc xá</option>
                </select>
                <span className="material-symbols-outlined text-on-surface-variant pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="font-label-md text-on-surface mb-2 block">Mức giá</label>
              <div className="relative">
                <select
                  className="bg-surface-container-lowest border-surface-border focus:border-primary font-body-md text-on-surface h-10 w-full cursor-pointer appearance-none rounded-lg border pr-10 pl-3 transition-colors outline-none"
                  value={filters.priceRange}
                  onChange={(e) => setFilters((f) => ({ ...f, priceRange: e.target.value }))}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="under-3m">Dưới 3 triệu</option>
                  <option value="3m-5m">3 - 5 triệu</option>
                  <option value="5m-10m">5 - 10 triệu</option>
                  <option value="over-10m">Trên 10 triệu</option>
                </select>
                <span className="material-symbols-outlined text-on-surface-variant pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                  expand_more
                </span>
              </div>
            </div>

            <button
              onClick={handleApplyFilters}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-md h-10 w-full rounded-lg shadow-sm transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-headline-md text-text-main">Kết quả tìm kiếm</h1>
          <div className="font-body-md text-on-surface-variant">
            {isLoading ? 'Đang tìm...' : `Hiển thị ${rooms.length} phòng`}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest border-surface-border rounded-xl border py-20 text-center">
            <span className="material-symbols-outlined text-on-surface-variant mb-4 text-4xl">search_off</span>
            <h3 className="font-headline-sm text-text-main mb-2">Không tìm thấy phòng nào</h3>
            <p className="font-body-md text-on-surface-variant">Vui lòng thử thay đổi điều kiện tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  )
}
