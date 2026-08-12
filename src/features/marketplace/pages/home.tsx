import { useNavigate } from 'react-router'
import { useMarketplaceRooms } from '@/shared/api/marketplace'
import { RoomCard } from '../components/room-card'
import { MarketStatsCard } from '../components/market-stats-card'
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
    <div className="flex flex-col w-full bg-slate-50/30">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 to-transparent pt-12 pb-24">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <div className="flex-1 flex flex-col gap-6 z-10 w-full max-w-2xl">
            <span className="font-label-sm text-primary uppercase tracking-widest font-semibold">Nền tảng cho thuê bất động sản</span>
            <h1 className="font-display text-slate-900 text-5xl md:text-6xl lg:text-[64px] leading-[1.1] tracking-tight">
              Tìm kiếm không gian sống <span className="text-primary italic font-serif">lý tưởng</span> của bạn
            </h1>
            <p className="font-body-md text-slate-600 max-w-xl text-lg">
              Quản lý việc thuê và cho thuê nhà chưa bao giờ dễ dàng hơn. Nhanh chóng, minh bạch và an toàn với Rental SaaS.
            </p>
            
            {/* Search Bar Component */}
            <div className="mt-6 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-3 w-full border border-slate-100">
              <div className="flex-1 w-full relative h-12">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">location_on</span>
                <input 
                  className="w-full h-full pl-12 pr-4 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl font-body-md text-slate-900 outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Thành phố, Quận..." 
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
                <span className="absolute left-4 top-[-10px] bg-white px-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider hidden md:block">Khu vực</span>
              </div>
              
              <div className="flex-1 w-full relative h-12">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">payments</span>
                <select 
                  className="w-full h-full pl-12 pr-10 bg-slate-50/50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl font-body-md text-slate-900 outline-none appearance-none transition-all cursor-pointer"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="under-3m">Dưới 3 triệu</option>
                  <option value="3m-5m">3 - 5 triệu</option>
                  <option value="5m-10m">5 - 10 triệu</option>
                  <option value="over-10m">Trên 10 triệu</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                <span className="absolute left-4 top-[-10px] bg-white px-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider hidden md:block">Khoảng giá</span>
              </div>
              
              <button 
                onClick={handleSearch}
                className="w-full md:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-white font-label-md font-medium rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">search</span> Tìm kiếm
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full hidden lg:flex justify-end relative h-[500px]">
            <div className="absolute right-0 top-10 w-[280px] h-[400px] rounded-3xl overflow-hidden shadow-2xl z-10 border-4 border-white transform translate-x-12 translate-y-12">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80" alt="Building exterior" className="w-full h-full object-cover" />
            </div>
            
            <div className="absolute right-32 top-0 w-[320px] h-[440px] rounded-3xl overflow-hidden shadow-xl z-0">
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80" alt="Person working" className="w-full h-full object-cover" />
            </div>

            <div className="absolute left-10 top-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-slate-900">10k+</p>
                <p className="font-label-sm text-slate-500">Phòng đang cho thuê</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900">Phòng nổi bật gần đây</h2>
            <p className="font-body-md text-slate-500 mt-2">Danh sách các phòng trọ, căn hộ được đánh giá cao và mới cập nhật.</p>
          </div>
          <button onClick={() => navigate('/phong')} className="inline-flex items-center gap-1 font-label-md text-primary hover:text-blue-700 transition-colors group font-medium">
            Xem tất cả <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {rooms[0] && (
              <div className="lg:col-span-1 h-[600px] lg:h-auto">
                <RoomCard room={rooms[0]} variant="featured-large" badge="new" />
              </div>
            )}
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              {rooms[1] && <RoomCard room={rooms[1]} />}
              {rooms[3] && <RoomCard room={rooms[3]} badge="hot" />}
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              {rooms[2] && <RoomCard room={rooms[2]} />}
              <div className="flex-1 min-h-[250px]">
                <MarketStatsCard />
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Tại sao chọn Rental SaaS?</h2>
            <p className="font-body-md text-slate-500 max-w-2xl mx-auto">
              Hệ sinh thái toàn diện giúp người thuê và chủ nhà kết nối, giao dịch và quản lý một cách chuyên nghiệp nhất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-50/50 rounded-3xl p-8 text-center border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">manage_search</span>
              </div>
              <h3 className="font-headline-sm font-bold text-slate-900 mb-3">Duyệt tin nhanh</h3>
              <p className="font-body-sm text-slate-500">
                Hệ thống lọc thông minh và kiểm duyệt tự động giúp bạn tìm thấy căn phòng phù hợp chỉ trong vài phút.
              </p>
            </div>
            
            <div className="bg-slate-50/50 rounded-3xl p-8 text-center border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="font-headline-sm font-bold text-slate-900 mb-3">Thanh toán an toàn</h3>
              <p className="font-body-sm text-slate-500">
                Tích hợp cổng thanh toán trực tuyến, minh bạch mọi khoản phí và tiền cọc với hợp đồng điện tử.
              </p>
            </div>
            
            <div className="bg-slate-50/50 rounded-3xl p-8 text-center border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">support_agent</span>
              </div>
              <h3 className="font-headline-sm font-bold text-slate-900 mb-3">Hỗ trợ 24/7</h3>
              <p className="font-body-sm text-slate-500">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ giải quyết các vấn đề phát sinh trong suốt quá trình thuê.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100">
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 150 C 300 300, 600 50, 1440 200 L 1440 400 L 0 400 Z" fill="rgba(255,255,255,0.3)"/>
            <path d="M0 250 C 400 50, 800 300, 1440 150 L 1440 400 L 0 400 Z" fill="rgba(255,255,255,0.4)"/>
          </svg>
        </div>
        
        <div className="relative z-10 mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Bắt đầu hành trình của bạn ngay hôm nay</h2>
          <p className="font-body-md text-slate-600 max-w-2xl mx-auto mb-10 text-lg">
            Dù bạn đang tìm kiếm một nơi ở mới hay muốn quản lý bất động sản cho thuê hiệu quả hơn, chúng tôi đều có giải pháp dành cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/phong')} className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-label-md font-medium rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Tìm phòng ngay <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button onClick={() => navigate('/dang-ky')} className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-label-md font-medium rounded-xl shadow-lg shadow-black/5 hover:bg-slate-50 transition-all">
              Trở thành chủ nhà
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
