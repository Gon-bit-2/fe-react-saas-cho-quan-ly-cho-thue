import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import type { TenantRole } from '@/shared/types/auth'

/**
 * Guard kiểm tra tenant role trong selected membership.
 * Phải đặt bên trong RequireTenantContext.
 */
export function RequireTenantRole({
  roles,
}: {
  /** Danh sách tenant roles được phép */
  roles: TenantRole[]
}) {
  const { hasTenantRole } = useAuth()

  const hasAccess = roles.some((role) => hasTenantRole(role))

  if (!hasAccess) {
    return <Navigate to="/loi-truy-cap" replace />
  }

  return <Outlet />
}
