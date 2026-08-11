import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Receipt,
  CreditCard,
  Bell,
  Package,
  LogOut,
  ChevronRight,
  Inbox,
  DoorOpen,
  FileClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { name: 'Tổng quan', href: '/app/tong-quan', icon: LayoutDashboard },
  { name: 'Trung tâm xử lý', href: '/app/trung-tam-xu-ly', icon: Inbox },
  { name: 'Nhà trọ', href: '/app/khu-tro', icon: Building },
  { name: 'Phòng', href: '/app/quan-ly-phong/danh-sach', icon: DoorOpen },
  { name: 'Hợp đồng', href: '/app/hop-dong', icon: FileText },
  { name: 'Yêu cầu kết thúc HĐ', href: '/app/yeu-cau-ket-thuc-hop-dong', icon: FileClock },
  { name: 'Hóa đơn và công nợ', href: '/app/hoa-don', icon: Receipt },
  { name: 'Thanh toán', href: '/app/thanh-toan', icon: CreditCard },
  { name: 'Khách hàng / Người thuê', href: '/app/nguoi-thue', icon: Users },
  { name: 'Thông báo', href: '/app/thong-bao', icon: Bell },
  { name: 'Gói dịch vụ', href: '/app/goi-dich-vu', icon: Package },
]

export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/dang-nhap')
  }

  // Redirect to dashboard if on /app
  useEffect(() => {
    if (location.pathname === '/app' || location.pathname === '/app/') {
      navigate('/app/tong-quan', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <div className="bg-surface font-body-md text-on-surface flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-surface-container-lowest fixed top-0 left-0 z-50 flex h-full w-[272px] flex-col shadow-[1px_0_8px_rgba(0,0,0,0.02)]">
        <div className="border-surface-border flex h-[64px] items-center gap-3 border-b px-6">
          <div className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded font-bold">
            EZ
          </div>
          <span className="font-headline-sm text-primary">EZ-Rental</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-4 py-3 transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <item.icon className="mr-3 h-[18px] w-[18px]" />
              <span className="font-label-md">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-surface-border bg-surface-container-lowest shrink-0 border-t p-4">
          <Button
            variant="ghost"
            className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-label-md w-full justify-start rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-[18px] w-[18px]" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-screen w-full flex-1 flex-col pl-[272px]">
        {/* Topbar */}
        <header className="bg-surface/80 border-surface-border fixed top-0 right-0 left-[272px] z-40 flex h-[64px] items-center justify-between border-b px-[32px] shadow-[0_1px_4px_rgba(0,0,0,0.02)] backdrop-blur-xl">
          <div className="text-on-surface-variant font-body-md flex items-center gap-4">
            <span className="text-on-surface">Quản lý</span>
            <ChevronRight className="h-[18px] w-[18px]" />
            <span className="text-primary font-semibold">Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <TenantSwitcher />

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Mở trung tâm thông báo"
                className="hover:bg-surface-container-high relative rounded-full p-2 transition-colors"
                onClick={() => navigate('/app/thong-bao')}
              >
                <Bell className="text-on-surface-variant h-5 w-5" />
                <span className="bg-error absolute top-1.5 right-1.5 h-2 w-2 rounded-full"></span>
              </button>

              <div className="border-surface-border flex items-center gap-3 border-l pl-4">
                <div className="hidden text-right sm:block">
                  <div className="font-label-md text-on-surface">{profile?.email || 'User'}</div>
                  <div className="text-on-surface-variant text-[10px] tracking-wider uppercase">
                    {profile?.systemRole || 'Owner'}
                  </div>
                </div>
                <div className="bg-primary-container text-on-primary-container ring-surface-container-high flex h-9 w-9 items-center justify-center rounded-full font-bold uppercase ring-2">
                  {profile?.email?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="bg-surface flex-1 p-[32px] pt-[64px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
