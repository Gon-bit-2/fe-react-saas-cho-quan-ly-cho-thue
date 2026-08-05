import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

/**
 * Guard kiểm tra permission code trong selected membership.
 * Phải đặt bên trong RequireTenantContext.
 *
 * Permission code format: `path_method` (ví dụ: `/auth/profile_GET`)
 */
export function RequirePermission({
  permissions,
}: {
  /** Danh sách permission codes cần có */
  permissions: string[]
}) {
  const { hasPermission } = useAuth()

  const hasAccess = permissions.every((perm) => hasPermission(perm))

  if (!hasAccess) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
