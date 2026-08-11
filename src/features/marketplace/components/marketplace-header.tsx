import { Link } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

export function MarketplaceHeader() {
  const { state, profile } = useAuth()
  const isAuthenticated = state === 'authenticated'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-surface-border">
      <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop h-topbar-height flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            {/* Vibe: Professional, minimalist logo representation */}
            <div className="h-8 w-auto flex items-center justify-center font-display text-primary font-bold text-xl">
              Rental<span className="text-text-main">SaaS</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-on-surface-variant font-label-md hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/phong" className="text-on-surface-variant font-label-md hover:text-primary transition-colors">
              Tìm phòng
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dang-nhap"
                className="px-4 py-2 text-on-surface font-label-md hover:bg-surface-container-low rounded-lg transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-ky"
                className="px-4 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:opacity-90 transition-opacity"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/app/thong-bao"
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
