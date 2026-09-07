import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  Crown,
  Tag,
  CheckSquare,
  MessageSquareQuote,
  Flag,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/shared/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

/**
 * Danh sách menu items cho admin sidebar theo mục 3.3 DESIGN.md
 */
const adminNavGroups = [
  {
    group: 'Tổng quan',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    group: 'Quản lý thực thể',
    items: [
      { name: 'Quản lý chủ trọ', path: '/admin/chu-tro', icon: Building },
      { name: 'Quản lý người thuê', path: '/admin/nguoi-thue', icon: Users },
      { name: 'Tiện ích hệ thống', path: '/admin/tien-ich', icon: Tag },
    ],
  },
  {
    group: 'Gói dịch vụ & Doanh thu',
    items: [
      { name: 'Gói dịch vụ SaaS', path: '/admin/goi-dich-vu', icon: Crown },
      { name: 'Thanh toán thuê bao', path: '/admin/thanh-toan-goi', icon: CreditCard },
    ],
  },
  {
    group: 'Kiểm duyệt & Tuân thủ',
    items: [
      { name: 'Kiểm duyệt tin đăng', path: '/admin/kiem-duyet/hang-cho', icon: CheckSquare },
      { name: 'Kiểm duyệt đánh giá', path: '/admin/kiem-duyet-danh-gia', icon: MessageSquareQuote },
      { name: 'Báo cáo vi phạm', path: '/admin/bao-cao-vi-pham', icon: Flag },
    ],
  },
]

/**
 * Layout trang quản trị Platform (/admin/*) dành cho Super Admin.
 * Tuân thủ DESIGN.md: Sidebar 272px, header 64px, Lucide icons và mobile drawer.
 */
export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  /**
   * Xử lý đăng xuất tài khoản và điều hướng về trang đăng nhập
   */
  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  /**
   * Kiểm tra item navigation có đang active hay không
   */
  const isNavActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  /**
   * Render danh sách các nhóm điều hướng sidebar
   */
  const renderNavLinks = () => (
    <div className="flex flex-col gap-6 px-3 py-4">
      {adminNavGroups.map((group) => (
        <div key={group.group} className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {group.group}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isNavActive(item.path, item.exact)

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`size-4.5 shrink-0 ${active ? 'text-primary-foreground' : 'text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      <Separator />

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start gap-3 rounded-xl px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4.5 shrink-0" />
        <span>Đăng xuất</span>
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex">
      {/* Desktop Admin Sidebar (272px) */}
      <aside className="hidden lg:flex w-[272px] flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-xs">
        <div className="h-16 flex items-center gap-2.5 border-b border-slate-200 px-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <img alt="Nhà Trọ Việt Logo" className="h-8 w-auto object-contain" src="/logo.png" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-primary leading-none">Nhà Trọ Việt</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">Admin Portal</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[272px] min-w-0">
        {/* Topbar (64px) */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-700">
                  <Menu className="size-5" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white">
                <SheetHeader className="h-16 border-b border-slate-200 px-6 flex items-center justify-start">
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <ShieldCheck className="size-5 text-primary" />
                    <span className="font-display font-bold text-base text-primary">Admin Portal</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <span className="font-heading font-semibold text-sm text-slate-700">Hệ thống Quản trị Nền tảng</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {profile?.fullName || profile?.email || 'Quản trị viên'}
              </p>
              <p className="text-xs text-primary font-medium uppercase tracking-wider">SUPER ADMIN</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-9 rounded-full p-0 ring-2 ring-slate-200 hover:ring-primary/40">
                  <img
                    alt="Profile"
                    className="size-full rounded-full object-cover"
                    src={
                      profile?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'Admin')}&background=random`
                    }
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'Admin')}&background=random`
                    }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{profile?.fullName || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer gap-2">
                    <span>Xem trang Marketplace</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive gap-2">
                  <LogOut className="size-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
