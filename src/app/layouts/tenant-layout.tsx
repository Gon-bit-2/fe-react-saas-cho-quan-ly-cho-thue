import { Outlet } from 'react-router'

/**
 * Layout cho tenant operations (sidebar + topbar).
 * Placeholder — sẽ thêm sidebar/topbar khi xây feature.
 */
export function Component() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
