import { Outlet } from 'react-router'

/**
 * Layout cho trang account (profile, chọn tenant).
 * Placeholder — sẽ thêm navigation khi xây feature.
 */
export function Component() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
