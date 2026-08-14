import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

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
      <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface-container-lowest z-50 flex flex-col shadow-[0_0_1px_rgba(0,0,0,0.1)] transition-all">
        {/* Logo & Brand */}
        <div className="h-topbar-height px-6 flex items-center border-b border-surface-border">
          <Link to="/" className="flex items-center gap-3">
            <img alt="Rental SaaS Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLu4TznyUBEtVnawD_HqEbeRssuo-WwEl3eP1yeXjhoM4pAwx-RtbSHvFViYRROUpnCb5g_VUY1nj6_CvzBh1Jo99bQAkFGcuhQZpAEt9q7Fp9lSRasW1rdyrsbWD769q-HN_LOKHqC65BOwad9q5DEQ8wPtSxV7fy270YJGpcLD2qNO0jiMmAPB6wrEvm641B5o0JuhxjA8CleZCKr2fp3Lzh1D5n4YCa6RpHJlmGn7gIB1Ml5A-ZWMLew"/>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight">RentalSaaS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
          {adminNavItems.map((item) => {
            // Nút đăng xuất xử lý riêng
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

            const isActive = isNavActive(item)
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
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">shield_person</span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">Quản trị hệ thống</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Profile info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="font-label-md text-label-md text-on-surface leading-none">
                  {profile?.fullName || profile?.email || 'Admin'}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {profile?.systemRole || 'ADMIN'}
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
