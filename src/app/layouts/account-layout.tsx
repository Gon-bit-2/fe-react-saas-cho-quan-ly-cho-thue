import { Outlet, Link, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { profileApi } from '@/features/auth/api/profile.api'
import { useAuth } from '@/shared/hooks/use-auth'

/**
 * Layout cho trang account (profile, chọn tenant).
 */
export function Component() {
  const location = useLocation()

  // Lấy dữ liệu profile để hiển thị ở header
  const { data: profileResponse } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => profileApi.getProfile(),
  })
  const user = profileResponse?.data
  const { logout } = useAuth()

  const navItems = [
    { name: 'Hồ sơ', path: '/tai-khoan', icon: 'person', exact: true },
    { name: 'Lịch xem phòng', path: '/tai-khoan/lich-xem-phong', icon: 'event' },
    { name: 'Yêu cầu thuê', path: '/tai-khoan/yeu-cau-thue', icon: 'send' },
    { name: 'Hợp đồng', path: '/tai-khoan/hop-dong', icon: 'description' },
    { name: 'Bàn giao', path: '/tai-khoan/ban-giao', icon: 'inventory_2' },
    { name: 'Hóa đơn', path: '/tai-khoan/hoa-don', icon: 'receipt_long' },
    { name: 'Thanh toán', path: '/tai-khoan/thanh-toan', icon: 'payments' },
    { name: 'Hỗ trợ', path: '/tai-khoan/ho-tro', icon: 'confirmation_number' },
    { name: 'Chọn khu trọ quản lý', path: '/tai-khoan/chon-nha-tro', icon: 'corporate_fare' },
  ]

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="w-sidebar-width bg-surface-container-lowest fixed top-0 left-0 z-50 flex h-full flex-col shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all">
        <div className="h-topbar-height border-surface-border flex items-center gap-3 border-b px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              alt="Nhà Trọ Việt Logo"
              className="h-8 w-auto object-contain"
              src="/logo.png"
            />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Nhà Trọ Việt</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
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

          <button
            onClick={async () => {
              await logout()
              window.location.href = '/dang-nhap'
            }}
            className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container mt-4 flex w-full items-center gap-3 rounded-lg px-4 py-2.5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Đăng xuất
          </button>
        </nav>
      </aside>

      {/* Main Container */}
      <div className="pl-sidebar-width flex min-h-screen flex-col">
        {/* Header */}
        <header className="left-sidebar-width h-topbar-height bg-surface/90 border-surface-border px-page-padding-desktop fixed top-0 right-0 z-40 flex items-center justify-between border-b backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              <span className="font-label-md text-label-md">Sunrise Towers</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="hover:bg-surface-container relative flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <div className="bg-error text-on-error border-surface absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] font-bold">
                3
              </div>
            </div>
            <div className="border-surface-border flex items-center gap-3 border-l pl-2">
              <div className="hidden text-right sm:block">
                <div className="font-label-md text-label-md text-on-surface leading-none">
                  {user?.fullName || 'Người dùng'}
                </div>
                <div className="text-on-surface-variant text-[11px]">
                  {user?.systemRole === 'ADMIN' ? 'Quản trị viên' : 'Quản lý vận hành'}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:ring-primary rounded-full outline-none focus:ring-2">
                    <img
                      alt="Profile"
                      className="ring-surface-border bg-surface-container h-9 w-9 cursor-pointer rounded-full object-cover ring-2"
                      src={
                        user?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Người dùng')}&background=random`
                      }
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Người dùng')}&background=random`
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/tai-khoan" className="cursor-pointer">
                      <span className="material-symbols-outlined mr-2 text-[18px]">person</span>
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-error focus:text-error cursor-pointer"
                    onClick={async () => {
                      await logout()
                      window.location.href = '/dang-nhap'
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
