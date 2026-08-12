import { useSearchParams } from 'react-router'
import { useState } from 'react'
import { useMarketplaceRooms } from '@/shared/api/marketplace'
import { RoomCard } from '../components/room-card'


export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Local state for filters
  const [filters, setFilters] = useState({
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    propertyType: searchParams.get('propertyType') || '',
    priceRange: searchParams.get('priceRange') || '',
  })

  // Parse filters for API
  const apiFilters: Record<string, string | number> = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  }
  
  if (filters.province) apiFilters.province = filters.province
  if (filters.district) apiFilters.district = filters.district
  if (filters.propertyType) apiFilters.propertyType = filters.propertyType
  if (filters.priceRange) {
    if (filters.priceRange === 'under-3m') apiFilters.maxPrice = 3000000
    if (filters.priceRange === '3m-5m') { apiFilters.minPrice = 3000000; apiFilters.maxPrice = 5000000 }
    if (filters.priceRange === '5m-10m') { apiFilters.minPrice = 5000000; apiFilters.maxPrice = 10000000 }
    if (filters.priceRange === 'over-10m') apiFilters.minPrice = 10000000
  }

  const { data, isLoading } = useMarketplaceRooms(apiFilters)

  // Fallback to mock data if API is loading or returns empty
  const rooms = data?.data || []

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.province) params.set('province', filters.province)
    if (filters.district) params.set('district', filters.district)
    if (filters.propertyType) params.set('propertyType', filters.propertyType)
    if (filters.priceRange) params.set('priceRange', filters.priceRange)
    
    setSearchParams(params)
  }

  return (
    <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-surface-container-lowest border border-surface-border p-4 rounded-xl sticky top-[calc(var(--spacing-topbar-height)+24px)]">
          <h2 className="font-headline-sm text-text-main mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">filter_list</span>
            Bộ lọc
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Tỉnh / Thành phố</label>
              <input 
                type="text" 
                placeholder="Nhập tỉnh thành..."
                className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={filters.province}
                onChange={e => setFilters(f => ({ ...f, province: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Quận / Huyện</label>
              <input 
                type="text" 
                placeholder="Nhập quận huyện..."
                className="w-full h-10 px-3 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors"
                value={filters.district}
                onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Loại hình</label>
              <div className="relative">
                <select 
                  className="w-full h-10 pl-3 pr-10 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none appearance-none transition-colors cursor-pointer"
                  value={filters.propertyType}
                  onChange={e => setFilters(f => ({ ...f, propertyType: e.target.value }))}
                >
                  <option value="">Tất cả</option>
                  <option value="HOUSE">Nhà nguyên căn</option>
                  <option value="MINI_APARTMENT">Chung cư mini</option>
                  <option value="APARTMENT">Chung cư</option>
                  <option value="DORM">Ký túc xá</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <div>
              <label className="font-label-md text-on-surface mb-2 block">Mức giá</label>
              <div className="relative">
                <select 
                  className="w-full h-10 pl-3 pr-10 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none appearance-none transition-colors cursor-pointer"
                  value={filters.priceRange}
                  onChange={e => setFilters(f => ({ ...f, priceRange: e.target.value }))}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="under-3m">Dưới 3 triệu</option>
                  <option value="3m-5m">3 - 5 triệu</option>
                  <option value="5m-10m">5 - 10 triệu</option>
                  <option value="over-10m">Trên 10 triệu</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            
            <button 
              onClick={handleApplyFilters}
              className="w-full h-10 bg-primary hover:bg-primary-container text-on-primary font-label-md rounded-lg shadow-sm transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-headline-md text-text-main">
            Kết quả tìm kiếm
          </h1>
          <div className="font-body-md text-on-surface-variant">
            {isLoading ? 'Đang tìm...' : `Hiển thị ${rooms.length} phòng`}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest border border-surface-border rounded-xl">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">search_off</span>
            <h3 className="font-headline-sm text-text-main mb-2">Không tìm thấy phòng nào</h3>
            <p className="font-body-md text-on-surface-variant">
              Vui lòng thử thay đổi điều kiện tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
