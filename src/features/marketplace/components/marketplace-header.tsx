import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { useState, useRef, useEffect } from 'react'

export function MarketplaceHeader() {
  const { state, profile, logout } = useAuth()
  const isAuthenticated = state === 'authenticated'
  const navigate = useNavigate()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    navigate('/dang-nhap')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-border">
      <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop h-topbar-height flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              alt="Nhà Trọ Việt Logo"
              className="h-8 w-auto object-contain"
              src="/logo.png"
            />
            <span className="font-display text-text-main font-bold text-xl hidden sm:block">
              Nhà Trọ Việt
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 ml-4">
            <Link to="/" className="text-primary font-label-md transition-colors">
              Trang chủ
            </Link>
            <Link to="/phong" className="text-on-surface-variant font-label-md hover:text-primary transition-colors">
              Tìm phòng
            </Link>
            <Link to="/gioi-thieu" className="text-on-surface-variant font-label-md hover:text-primary transition-colors">
              Giới thiệu
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dang-nhap"
                className="px-4 py-2 text-on-surface-variant font-label-md hover:text-primary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="px-5 py-2.5 bg-primary text-on-primary font-label-md rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/thong-bao"
                aria-label="Mở trung tâm thông báo"
                className="text-on-surface-variant hover:text-primary flex items-center justify-center"
              >
                <span className="material-symbols-outlined">notifications</span>
              </Link>
              
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-label-md cursor-pointer outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl shadow-lg border border-surface-border overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link 
                      to="/tai-khoan" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                      Thông tin tài khoản
                    </Link>
                    <Link 
                      to="/tai-khoan/phong-yeu-thich" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">favorite</span>
                      Phòng yêu thích
                    </Link>
                    <Link 
                      to="/tai-khoan/lich-su-xem" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_clock</span>
                      Lịch sử xem phòng
                    </Link>
                    <Link 
                      to="/tai-khoan/danh-gia" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">reviews</span>
                      Đánh giá của tôi
                    </Link>
                    <Link 
                      to="/tai-khoan/chon-nha-tro" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">real_estate_agent</span>
                      Đăng ký chủ trọ
                    </Link>
                    <Link 
                      to="/goi-dich-vu" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container-low text-on-surface font-body-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">diamond</span>
                      Gói dịch vụ
                    </Link>
                    
                    <div className="h-px bg-surface-border my-2"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error-container/20 text-error font-body-md transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
