import { useNavigate } from 'react-router'
import { useMarketplaceRooms } from '@/shared/api/marketplace'
import { RoomCard } from '../components/room-card'
import { useState } from 'react'

export function Component() {
  const navigate = useNavigate()
  const { data, isLoading } = useMarketplaceRooms({ limit: 6 })
  
  const [province, setProvince] = useState('')
  const [priceRange, setPriceRange] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (province) params.set('province', province)
    if (priceRange) {
      if (priceRange === 'under-3m') params.set('maxPrice', '3000000')
      if (priceRange === '3m-5m') { params.set('minPrice', '3000000'); params.set('maxPrice', '5000000') }
      if (priceRange === '5m-10m') { params.set('minPrice', '5000000'); params.set('maxPrice', '10000000') }
      if (priceRange === 'over-10m') params.set('minPrice', '10000000')
    }
    navigate(`/phong?${params.toString()}`)
  }

  const rooms = data?.data || []

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface rounded-b-3xl shadow-md">
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-20 mix-blend-multiply" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/50" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <span className="font-label-sm text-primary uppercase tracking-widest">Nền tảng cho thuê bất động sản</span>
            <h1 className="font-display text-text-main text-4xl md:text-5xl lg:text-6xl max-w-2xl leading-tight">
              Tìm kiếm không gian sống <span className="text-primary italic">lý tưởng</span> của bạn
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl">
              Quản lý việc thuê và cho thuê nhà chưa bao giờ dễ dàng hơn. Nhanh chóng, minh bạch và an toàn với Rental SaaS.
            </p>
            
            {/* Search Bar Component */}
            <div className="mt-8 bg-surface-container-lowest p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-end md:items-center gap-4 w-full max-w-3xl border border-surface-border">
              <div className="flex-1 w-full flex flex-col gap-2">
                <label className="font-label-md text-on-surface ml-1">Khu vực</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">location_on</span>
                  <input 
                    className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none transition-colors" 
                    placeholder="Thành phố, Quận, Huyện..." 
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 w-full flex flex-col gap-2">
                <label className="font-label-md text-on-surface ml-1">Khoảng giá</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">payments</span>
                  <select 
                    className="w-full h-10 pl-10 pr-10 bg-surface-container-lowest border border-surface-border focus:border-primary rounded-lg font-body-md text-on-surface outline-none appearance-none transition-colors cursor-pointer"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
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
                onClick={handleSearch}
                className="w-full md:w-auto h-10 px-8 bg-primary hover:bg-primary-container text-on-primary font-label-md rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">search</span> Tìm kiếm
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full hidden lg:flex justify-end relative">
            <div className="w-full max-w-md aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-xl relative group -mt-16 -mr-8 border border-surface-border">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80')" }}
              />
              <div className="absolute bottom-6 left-6 right-6 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-xl shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase">Giao dịch thành công</p>
                    <p className="font-headline-sm text-text-main">Hợp đồng điện tử</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg text-text-main">Phòng nổi bật gần đây</h2>
            <p className="font-body-md text-on-surface-variant mt-2">Danh sách các phòng trọ, căn hộ được đánh giá cao và mới cập nhật.</p>
          </div>
          <button onClick={() => navigate('/phong')} className="inline-flex items-center gap-1 font-label-md text-primary hover:text-primary-container transition-colors group">
            Xem tất cả <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0 && <RoomCard room={rooms[0]} variant="featured" />}
            {rooms.slice(1).map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <h2 className="font-headline-lg text-text-main mb-4">Bạn là chủ nhà hoặc người quản lý?</h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
            Trải nghiệm nền tảng quản lý phòng trọ chuyên nghiệp, tự động hóa quy trình thuê và thu tiền.
          </p>
          <button onClick={() => navigate('/dang-ky')} className="px-8 py-3 bg-primary text-on-primary font-label-md rounded-lg shadow-md hover:opacity-90 transition-opacity">
            Bắt đầu quản lý ngay
          </button>
        </div>
      </section>
    </div>
  )
}
