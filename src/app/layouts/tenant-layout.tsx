import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  CalendarDays,
  FileCheck2,
  Users,
  UserCheck,
  FileText,
  FileX2,
  Boxes,
  Gauge,
  Droplets,
  ScanLine,
  Zap,
  Receipt,
  CreditCard,
  Crown,
  LifeBuoy,
  Bell,
  LogOut,
  Menu,
  User,
  Shield,
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
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'
import { useNotificationsControllerCountUnread } from '@/shared/api/notify'
import { FloatingChatWidget } from '@/features/chat/components/floating-chat-widget'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/**
 * Cấu trúc các nhóm menu Sidebar Tenant theo chuẩn mục 3.2 của DESIGN.md
 */
const navGroups = [
  {
    group: 'Tổng quan',
    items: [
      { name: 'Tổng quan', path: '/tong-quan', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Nguồn cung',
    items: [
      { name: 'Khu trọ', path: '/khu-tro', icon: Building2 },
      { name: 'Quản lý phòng', path: '/quan-ly-phong/danh-sach', icon: DoorOpen },
      { name: 'Tài sản phòng', path: '/quan-ly-tai-san', icon: Boxes },
    ],
  },
  {
    group: 'Khách thuê & Lịch hẹn',
    items: [
      { name: 'Lịch xem phòng', path: '/lich-xem-phong', icon: CalendarDays },
      { name: 'Yêu cầu thuê', path: '/yeu-cau-thue', icon: FileCheck2 },
      { name: 'Người thuê', path: '/nguoi-thue', icon: Users },
      { name: 'Nhân viên quản lý', path: '/quan-ly-nhan-vien', icon: UserCheck },
    ],
  },
  {
    group: 'Hợp đồng',
    items: [
      { name: 'Hợp đồng thuê', path: '/hop-dong', icon: FileText },
      { name: 'Yêu cầu kết thúc', path: '/yeu-cau-ket-thuc-hop-dong', icon: FileX2 },
    ],
  },
  {
    group: 'Điện nước & Dịch vụ',
    items: [
      { name: 'Công tơ', path: '/dien-nuoc/cong-to', icon: Gauge },
      { name: 'Chỉ số', path: '/dien-nuoc/chi-so', icon: Droplets },
      { name: 'Nhận diện OCR', path: '/dien-nuoc/ocr-review', icon: ScanLine },
      { name: 'Dịch vụ thêm', path: '/dich-vu', icon: Zap },
    ],
  },
  {
    group: 'Tài chính',
    items: [
      { name: 'Hóa đơn', path: '/hoa-don', icon: Receipt },
      { name: 'Thanh toán', path: '/thanh-toan', icon: CreditCard },
    ],
  },
  {
    group: 'Vận hành & Hỗ trợ',
    items: [
      { name: 'Sự cố & Hỗ trợ', path: '/ho-tro', icon: LifeBuoy },
      { name: 'Thông báo', path: '/thong-bao', icon: Bell },
      { name: 'Gói dịch vụ SaaS', path: '/goi-dich-vu', icon: Crown },
    ],
  },
]

/**
 * Layout chính cho hệ thống vận hành Tenant (Chủ trọ, Quản lý, Kế toán, Nhân viên).
 * Tuân thủ DESIGN.md: Sidebar rộng 272px, nhóm menu có tổ chức, topbar 64px, tích hợp Drawer mobile.
 */
export function Component() {
  const { profile, logout, selectedMembership } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: unreadCount = 0 } = useNotificationsControllerCountUnread()

  /**
   * Chuyển đổi mã vai trò sang nhãn hiển thị tiếng Việt thân thiện
   */
  const getRoleLabel = (roleId?: string | null) => {
    switch (roleId) {
      case 'ADMIN':
        return 'Quản trị viên'
      case 'LANDLORD':
        return 'Chủ trọ'
      case 'MANAGER':
        return 'Quản lý vận hành'
      case 'ACCOUNTANT':
        return 'Kế toán'
      case 'MAINTENANCE_STAFF':
        return 'Nhân viên bảo trì'
      case 'TENANT':
        return 'Người thuê'
      default:
        return 'Thành viên'
    }
  }

  const displayRole = getRoleLabel(selectedMembership?.roleId || profile?.systemRole)

  /**
   * Xử lý đăng xuất tài khoản và đưa người dùng về trang đăng nhập
   */
  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  /**
   * Render danh sách các nhóm liên kết Sidebar
   */
  const renderNavLinks = () => (
    <div className="flex flex-col gap-6 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.group} className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {group.group}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path !== '/tong-quan' && location.pathname.startsWith(item.path))

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`size-4.5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-slate-500'}`} />
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
      {/* Desktop Sidebar (Rộng 272px theo mục 3.2 DESIGN.md) */}
      <aside className="hidden lg:flex w-[272px] flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-xs">
        {/* Brand header (64px) */}
        <div className="h-16 flex items-center gap-3 border-b border-slate-200 px-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <img alt="Nhà Trọ Việt Logo" className="h-8 w-auto object-contain" src="/logo.png" />
            <span className="font-display font-bold text-lg text-primary tracking-tight">Nhà Trọ Việt</span>
          </Link>
        </div>

        {/* Scrollable menu */}
        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-[272px] min-w-0">
        {/* Topbar (Cao 64px theo mục 3.2 DESIGN.md) */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-700">
                  <Menu className="size-5" />
                  <span className="sr-only">Mở menu điều hướng</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white">
                <SheetHeader className="h-16 border-b border-slate-200 px-6 flex items-center justify-start">
                  <SheetTitle className="flex items-center gap-2.5 text-left">
                    <img alt="Nhà Trọ Việt Logo" className="h-7 w-auto object-contain" src="/logo.png" />
                    <span className="font-display font-bold text-base text-primary">Nhà Trọ Việt</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
              </SheetContent>
            </Sheet>

            {/* Tenant Switcher */}
            <TenantSwitcher />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/thong-bao')}
              className="relative text-slate-600 hover:text-slate-900 rounded-full"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 size-4.5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* User Profile dropdown */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {profile?.fullName || profile?.email || 'Người dùng'}
                </p>
                <p className="text-xs text-slate-500 font-medium">{displayRole}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-9 rounded-full p-0 ring-2 ring-slate-200 hover:ring-primary/40">
                    <img
                      alt="Avatar"
                      className="size-full rounded-full object-cover"
                      src={
                        profile?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'User')}&background=random`
                      }
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || profile?.email || 'User')}&background=random`
                      }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{profile?.fullName || 'Người dùng'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/tai-khoan" className="cursor-pointer gap-2">
                      <User className="size-4" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  {profile?.systemRole === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer gap-2 text-primary">
                        <Shield className="size-4" />
                        <span>Trang quản trị Platform</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive gap-2">
                    <LogOut className="size-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <div className="print:hidden">
        <FloatingChatWidget />
      </div>
    </div>
  )
}
