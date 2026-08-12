import { Link } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

export function MarketplaceHeader() {
  const { state, profile } = useAuth()
  const isAuthenticated = state === 'authenticated'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-border">
      <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop h-topbar-height flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">home</span>
            </div>
            <span className="font-display text-text-main font-bold text-xl hidden sm:block">
              RentalSaaS
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
              <Link to="/tai-khoan" className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-label-md cursor-pointer">
                {profile?.email?.charAt(0).toUpperCase() || 'U'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
