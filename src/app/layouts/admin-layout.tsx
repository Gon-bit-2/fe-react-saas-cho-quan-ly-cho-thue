import { Outlet } from 'react-router'

/**
 * Layout cho platform admin.
 * Placeholder — sẽ thêm admin sidebar khi xây feature.
 */
export function Component() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
