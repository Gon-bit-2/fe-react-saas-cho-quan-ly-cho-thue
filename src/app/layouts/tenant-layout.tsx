import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { TenantSwitcher } from '@/features/tenant-app/components/tenant-switcher'

const navItems = [
  { name: 'Tổng quan', path: '/tong-quan', icon: 'grid_view' },
  { name: 'Khu trọ', path: '/khu-tro', icon: 'apartment' },
  { name: 'Quản lý phòng', path: '/quan-ly-phong/danh-sach', icon: 'door_open' },
  { name: 'Người thuê', path: '/nguoi-thue', icon: 'group' },
  { name: 'Hợp đồng', path: '/hop-dong', icon: 'description' },
  { name: 'Yêu cầu kết thúc', path: '/yeu-cau-ket-thuc-hop-dong', icon: 'assignment_late' },
  { name: 'Tài sản', path: '/quan-ly-tai-san', icon: 'inventory_2' },
  { name: 'Điện nước', path: '/dien-nuoc/chi-so', icon: 'water_ec' },
  { name: 'Dịch vụ', path: '/dich-vu', icon: 'electric_bolt' },
  { name: 'Hóa đơn', path: '/hoa-don', icon: 'receipt_long' },
  { name: 'Thanh toán', path: '/thanh-toan', icon: 'payments' },
  { name: 'Hỗ trợ', path: '/ho-tro', icon: 'confirmation_number' },
  { name: 'Thông báo', path: '/thong-bao', icon: 'notifications' },
  { name: 'Đăng xuất', path: '#logout', icon: 'logout' },
]

export function Component() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
    navigate('/dang-nhap')
  }


  return (
    <div className="bg-background font-body-md text-body-md text-on-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface-container-lowest z-50 flex flex-col shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all">
        <div className="h-topbar-height px-6 flex items-center gap-3 border-b border-surface-border">
          <Link to="/" className="flex items-center gap-3">
            <img alt="Rental SaaS Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLu4TznyUBEtVnawD_HqEbeRssuo-WwEl3eP1yeXjhoM4pAwx-RtbSHvFViYRROUpnCb5g_VUY1nj6_CvzBh1Jo99bQAkFGcuhQZpAEt9q7Fp9lSRasW1rdyrsbWD769q-HN_LOKHqC65BOwad9q5DEQ8wPtSxV7fy270YJGpcLD2qNO0jiMmAPB6wrEvm641B5o0JuhxjA8CleZCKr2fp3Lzh1D5n4YCa6RpHJlmGn7gIB1Ml5A-ZWMLew"/>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">RentalSaaS</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            if (item.path === '#logout') {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 rounded-lg transition-all gap-3 text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
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
                className={`flex items-center px-4 py-2.5 rounded-lg transition-all gap-3 ${
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
      <div className="pl-sidebar-width min-h-screen flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-sidebar-width right-0 h-topbar-height bg-surface/90 backdrop-blur-md border-b border-surface-border z-40 flex items-center justify-between px-page-padding-desktop">
          <div className="flex items-center gap-4">
            <TenantSwitcher />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center cursor-pointer hover:bg-surface-container p-2 rounded-full transition-colors" onClick={() => navigate('/thong-bao')}>
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <div className="absolute top-1 right-1 w-4 h-4 bg-error text-[10px] text-on-error flex items-center justify-center rounded-full font-bold border-2 border-surface">
                3
              </div>
            </div>
            <div className="flex items-center gap-3 pl-2 border-l border-surface-border">
              <div className="text-right hidden sm:block">
                <div className="font-label-md text-label-md text-on-surface leading-none">
                  {profile?.fullName || profile?.email || 'User'}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {profile?.systemRole || 'Operations Manager'}
                </div>
              </div>
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-border bg-surface-container"
                src={profile?.avatarUrl || "https://lh3.googleusercontent.com/aida/AP1WRLuQMVpC8QYZ7FsWVpY1MwXUz_zJhZzfhtOVak4FsNy3sFImF-YjFjcYuXOgh-CbowsVLEMolwp6qfnXTdn0Lr7TG3y2YbJ7O7_dSkDeps9GvAORAGc-VpiTAmRUZi1t10K2sB0jEU_gksjR8UZ1zCQ6nNKtr0FQPw3rxjs26okfKhLli9-gOx_SUWWNyJZ4HOQaLSnsLrLddFqAlUqyqrGukyZTc9MZZf1T70T0BkvZUJc8pRWnvuZ6Tc0"}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pt-topbar-height bg-background p-page-padding-desktop">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
