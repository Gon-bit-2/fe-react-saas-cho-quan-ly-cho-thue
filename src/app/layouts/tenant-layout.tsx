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
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'
import { useNotificationsControllerCountUnread } from '@/shared/api/generated/notifications/notifications'

const navItems = [
  { name: 'Tổng quan', path: '/tong-quan', icon: 'grid_view' },
  { name: 'Khu trọ', path: '/khu-tro', icon: 'apartment' },
  { name: 'Quản lý phòng', path: '/quan-ly-phong/danh-sach', icon: 'door_open' },
  { name: 'Yêu cầu thuê', path: '/yeu-cau-thue', icon: 'assignment_turned_in' },
  { name: 'Lịch xem phòng', path: '/lich-xem-phong', icon: 'calendar_month' },
  { name: 'Người thuê', path: '/nguoi-thue', icon: 'group' },
  { name: 'Hợp đồng', path: '/hop-dong', icon: 'description' },
  { name: 'Yêu cầu kết thúc', path: '/yeu-cau-ket-thuc-hop-dong', icon: 'assignment_late' },
  { name: 'Tài sản', path: '/quan-ly-tai-san', icon: 'inventory_2' },
  { name: 'Công tơ', path: '/dien-nuoc/cong-to', icon: 'speed' },
  { name: 'Chỉ số', path: '/dien-nuoc/chi-so', icon: 'water_ec' },
  { name: 'Nhận diện OCR', path: '/dien-nuoc/ocr-review', icon: 'document_scanner' },
  { name: 'Dịch vụ', path: '/dich-vu', icon: 'electric_bolt' },
  { name: 'Hóa đơn', path: '/hoa-don', icon: 'receipt_long' },
  { name: 'Thanh toán', path: '/thanh-toan', icon: 'payments' },
  { name: 'Gói dịch vụ', path: '/goi-dich-vu', icon: 'workspace_premium' },
  { name: 'Hỗ trợ', path: '/ho-tro', icon: 'confirmation_number' },
  { name: 'Thông báo', path: '/thong-bao', icon: 'notifications' },
  { name: 'Đăng xuất', path: '#logout', icon: 'logout' },
]

export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const { data: unreadCount = 0 } = useNotificationsControllerCountUnread()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
    navigate('/dang-nhap')
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="w-sidebar-width bg-surface-container-lowest fixed top-0 left-0 z-50 flex h-full flex-col shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all">
        <div className="h-topbar-height border-surface-border flex items-center gap-3 border-b px-6">
          <Link to="/" className="flex items-center gap-3">
            <img alt="Nhà Trọ Việt Logo" className="h-8 w-auto object-contain" src="/logo.png" />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Nhà Trọ Việt</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
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

            const isActive = location.pathname.startsWith(item.path)
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
          <div className="flex items-center gap-4">
            <TenantSwitcher />
          </div>
          <div className="flex items-center gap-6">
            <div
              className="hover:bg-surface-container relative flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors"
              onClick={() => navigate('/thong-bao')}
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {unreadCount > 0 && (
                <div className="bg-error text-on-error border-surface absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            <div className="border-surface-border flex items-center gap-3 border-l pl-2">
              <div className="hidden text-right sm:block">
                <div className="font-label-md text-label-md text-on-surface leading-none">
                  {profile?.fullName || profile?.email || 'Người dùng'}
                </div>
                <div className="text-on-surface-variant text-[11px]">{profile?.systemRole || 'Quản lý vận hành'}</div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:ring-primary rounded-full outline-none focus:ring-2">
                    <img
                      alt="Profile"
                      className="ring-surface-border bg-surface-container h-9 w-9 cursor-pointer rounded-full object-cover ring-2"
                      src={
                        profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'User')}&background=random`
                      }
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'User')}&background=random`
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/quan-ly/thong-tin-tai-khoan" className="cursor-pointer">
                      <span className="material-symbols-outlined mr-2 text-[18px]">person</span>
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
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
