import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Zap,
  Receipt,
  CreditCard,
  Ticket,
  Bell,
  Package,
  LogOut,
  ChevronRight,
  Inbox
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { name: 'Tổng quan', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Trung tâm xử lý', href: '/app/action-center', icon: Inbox },
  { name: 'Nhà trọ', href: '/app/properties', icon: Building },
  { name: 'Khách thuê', href: '/app/renters', icon: Users },
  { name: 'Hợp đồng', href: '/app/contracts', icon: FileText },
  { name: 'Điện nước và dịch vụ', href: '/app/services', icon: Zap },
  { name: 'Hóa đơn và công nợ', href: '/app/invoices', icon: Receipt },
  { name: 'Thanh toán', href: '/app/payments', icon: CreditCard },
  { name: 'Ticket', href: '/app/tickets', icon: Ticket },
  { name: 'Thông báo', href: '/app/notifications', icon: Bell },
  { name: 'Gói dịch vụ', href: '/app/packages', icon: Package },
]

export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Redirect to dashboard if on /app
  if (location.pathname === '/app' || location.pathname === '/app/') {
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-surface font-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[272px] bg-surface-container-lowest z-50 flex flex-col shadow-[1px_0_8px_rgba(0,0,0,0.02)]">
        <div className="h-[64px] px-6 flex items-center gap-3 border-b border-surface-border">
          <div className="h-8 w-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold">
            EZ
          </div>
          <span className="font-headline-sm text-primary">EZ-Rental</span>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-all ${
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

        <div className="shrink-0 border-t border-surface-border p-4 bg-surface-container-lowest">
          <Button
            variant="ghost"
            className="w-full justify-start text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors rounded-lg font-label-md"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-[18px] w-[18px]" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-[272px] flex min-h-screen flex-1 flex-col w-full">
        {/* Topbar */}
        <header className="fixed top-0 left-[272px] right-0 h-[64px] bg-surface/80 backdrop-blur-xl z-40 border-b border-surface-border px-[32px] flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 text-on-surface-variant font-body-md">
            <span className="text-on-surface">Quản lý</span>
            <ChevronRight className="h-[18px] w-[18px]" />
            <span className="text-primary font-semibold">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-6">
            <TenantSwitcher />
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
                <Bell className="h-5 w-5 text-on-surface-variant" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
                <div className="text-right hidden sm:block">
                  <div className="font-label-md text-on-surface">{profile?.email || 'User'}</div>
                  <div className="text-[10px] uppercase text-on-surface-variant tracking-wider">
                    {profile?.systemRole || 'Owner'}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ring-2 ring-surface-container-high font-bold uppercase">
                  {profile?.email?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pt-[64px] bg-surface p-[32px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
