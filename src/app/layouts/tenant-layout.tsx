import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'
import { LayoutDashboard, Building, DoorOpen, Users, FileText, Receipt, Ticket, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Nhà trọ', href: '/app/properties', icon: Building },
  { name: 'Phòng', href: '/app/rooms', icon: DoorOpen },
  { name: 'Người thuê', href: '/app/renters', icon: Users },
  { name: 'Hợp đồng', href: '/app/contracts', icon: FileText },
  { name: 'Hóa đơn', href: '/app/invoices', icon: Receipt },
  { name: 'Ticket', href: '/app/tickets', icon: Ticket },
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r bg-white">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <span className="text-primary text-xl font-bold tracking-tight">RoomManager</span>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="shrink-0 border-t p-4">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full font-bold">
              {profile?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{profile?.email}</span>
              <span className="text-muted-foreground truncate text-xs">{profile?.systemRole}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-8">
          <div>
            <TenantSwitcher />
          </div>
          <div className="flex items-center gap-4">{/* Add more topbar actions here if needed */}</div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
