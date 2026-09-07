import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Heart,
  Calendar,
  Send,
  FileText,
  Boxes,
  Receipt,
  CreditCard,
  LifeBuoy,
  Building2,
  LogOut,
  Menu,
} from 'lucide-react'
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
import { FloatingChatWidget } from '@/features/chat/components/floating-chat-widget'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

/**
 * Layout cho trang tài khoản cá nhân (/tai-khoan/*).
 * Áp dụng Shadcn UI và hỗ trợ responsive mobile navigation.
 */
export function Component() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => profileApi.getProfile(),
  })
  const { profile: user, logout, selectedMembership } = useAuth()

  /**
   * Chuyển đổi mã vai trò sang nhãn hiển thị tiếng Việt
   */
  const getRoleLabel = (roleId?: string | null) => {
    switch (roleId) {
      case 'ADMIN':
        return 'Quản trị viên'
      case 'LANDLORD':
        return 'Chủ trọ'
      case 'MANAGER':
        return 'Quản lý vận hành'
      case 'TENANT':
        return 'Người thuê'
      case 'USER':
        return 'Người dùng'
      default:
        return 'Người dùng'
    }
  }

  const displayRole = getRoleLabel(selectedMembership?.roleId || user?.systemRole)

  const navItems = [
    { name: 'Hồ sơ cá nhân', path: '/tai-khoan', icon: User, exact: true },
    { name: 'Phòng yêu thích', path: '/tai-khoan/phong-yeu-thich', icon: Heart },
    { name: 'Lịch xem phòng', path: '/tai-khoan/lich-xem-phong', icon: Calendar },
    { name: 'Yêu cầu thuê', path: '/tai-khoan/yeu-cau-thue', icon: Send },
    { name: 'Hợp đồng của tôi', path: '/tai-khoan/hop-dong', icon: FileText },
    { name: 'Biên bản bàn giao', path: '/tai-khoan/ban-giao', icon: Boxes },
    { name: 'Hóa đơn tiền phòng', path: '/tai-khoan/hoa-don', icon: Receipt },
    { name: 'Lịch sử thanh toán', path: '/tai-khoan/thanh-toan', icon: CreditCard },
    { name: 'Yêu cầu hỗ trợ', path: '/tai-khoan/ho-tro', icon: LifeBuoy },
    { name: 'Chọn khu trọ quản lý', path: '/tai-khoan/chon-nha-tro', icon: Building2 },
  ]

  /**
   * Xử lý đăng xuất tài khoản
   */
  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  /**
   * Render danh sách các liên kết điều hướng tài khoản
   */
  const renderNavLinks = () => (
    <div className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
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

      <Separator className="my-3" />

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start gap-3 rounded-xl px-3.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4.5 shrink-0" />
        <span>Đăng xuất</span>
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex">
      {/* Desktop Account Sidebar (272px) */}
      <aside className="hidden lg:flex w-[272px] flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 shadow-xs">
        <div className="h-16 flex items-center gap-2.5 border-b border-slate-200 px-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <img alt="Nhà Trọ Việt Logo" className="h-8 w-auto object-contain" src="/logo.png" />
            <span className="font-display font-bold text-lg text-primary tracking-tight">Nhà Trọ Việt</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:pl-[272px] min-w-0">
        {/* Topbar (64px) */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-700">
                  <Menu className="size-5" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white">
                <SheetHeader className="h-16 border-b border-slate-200 px-6 flex items-center justify-start">
                  <SheetTitle className="flex items-center gap-2.5 text-left">
                    <User className="size-5 text-primary" />
                    <span className="font-display font-bold text-base text-primary">Tài khoản</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
              </SheetContent>
            </Sheet>

            <span className="font-heading font-semibold text-sm text-slate-700">Tài khoản & Hoạt động thuê</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.fullName || user?.email || 'Người dùng'}
              </p>
              <p className="text-xs text-slate-500 font-medium">{displayRole}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-9 rounded-full p-0 ring-2 ring-slate-200 hover:ring-primary/40">
                  <img
                    alt="Profile"
                    className="size-full rounded-full object-cover"
                    src={
                      user?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Người dùng')}&background=random`
                    }
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Người dùng')}&background=random`
                    }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.fullName || 'Người dùng'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tai-khoan" className="cursor-pointer gap-2">
                    <User className="size-4" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tong-quan" className="cursor-pointer gap-2 text-primary">
                    <Building2 className="size-4" />
                    <span>Quản trị khu trọ</span>
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <FloatingChatWidget />
    </div>
  )
}
