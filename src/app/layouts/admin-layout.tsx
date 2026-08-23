import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
/**
 * Danh sách menu items cho admin sidebar.
 * Mỗi item gồm tên hiển thị, đường dẫn, và icon Material Symbols.
 */
const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
  { name: 'Quản lý chủ trọ', path: '/admin/chu-tro', icon: 'real_estate_agent' },
  { name: 'Quản lý người thuê', path: '/admin/nguoi-thue', icon: 'group' },
  { name: 'Gói dịch vụ SaaS', path: '/admin/goi-dich-vu', icon: 'package_2' },
  { name: 'Thanh toán SaaS', path: '/admin/thanh-toan-goi', icon: 'payments' },
  { name: 'Tiện ích', path: '/admin/tien-ich', icon: 'category' },
  { name: 'Kiểm duyệt bài đăng', path: '/admin/kiem-duyet/hang-cho', icon: 'fact_check' },
  { name: 'Kiểm duyệt đánh giá', path: '/admin/kiem-duyet-danh-gia', icon: 'reviews' },
  { name: 'Báo cáo vi phạm', path: '/admin/bao-cao-vi-pham', icon: 'report' },
  { name: 'Đăng xuất', path: '#logout', icon: 'logout' },
]

/**
 * Layout chính cho platform admin (/admin/*).
 * Bao gồm sidebar navigation, top header và main content area.
 * Tái sử dụng design tokens (sidebar-width, topbar-height, ...) từ design system chung.
 */
export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /** Xử lý đăng xuất: clear session rồi redirect về trang đăng nhập */
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
    navigate('/dang-nhap')
  }

  /**
   * Kiểm tra nav item có đang active hay không.
   * Item "Dashboard" chỉ active khi path chính xác là /admin.
   * Các item khác active khi pathname bắt đầu bằng path của item.
   */
  const isNavActive = (item: (typeof adminNavItems)[number]) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="w-sidebar-width bg-surface-container-lowest fixed top-0 left-0 z-50 flex h-full flex-col shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all">
        {/* Logo & Brand */}
        <div className="h-topbar-height border-surface-border flex items-center border-b px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              alt="Nhà Trọ Việt Logo"
              className="h-8 w-auto object-contain"
              src="/logo.png"
            />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Nhà Trọ Việt</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {adminNavItems.map((item) => {
            // Nút đăng xuất xử lý riêng
            if (item.path === '#logout') {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container flex w-full items-center gap-3 rounded-lg px-4 py-2.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              )
            }

            const isActive = isNavActive(item)
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all ${
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed-variant font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="pl-sidebar-width flex min-h-screen flex-col">
        {/* Header */}
        <header className="left-sidebar-width h-topbar-height bg-surface/90 border-surface-border px-page-padding-desktop fixed top-0 right-0 z-40 flex items-center justify-between border-b backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">shield_person</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">Quản trị hệ thống</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Profile info */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="font-label-md text-label-md text-on-surface leading-none">
                  {profile?.fullName || profile?.email || 'Quản trị viên'}
                </div>
                <div className="text-on-surface-variant text-[11px]">{profile?.systemRole || 'QUẢN TRỊ VIÊN'}</div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:ring-primary rounded-full outline-none focus:ring-2">
                    <img
                      alt="Profile"
                      className="ring-surface-border bg-surface-container h-9 w-9 cursor-pointer rounded-full object-cover ring-2"
                      src={
                        profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'Admin')}&background=random`
                      }
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'Admin')}&background=random`
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-error focus:text-error cursor-pointer"
                    onClick={async () => {
                      await logout()
                      navigate('/dang-nhap')
                    }}
                  >
                    <span className="material-symbols-outlined mr-2 text-[18px]">logout</span>
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pt-topbar-height bg-background p-page-padding-desktop flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
