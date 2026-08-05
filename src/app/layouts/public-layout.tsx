import { Outlet } from 'react-router'

/**
 * Layout công khai cho marketplace.
 * Placeholder — sẽ thêm header/footer khi xây feature.
 */
export function Component() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
