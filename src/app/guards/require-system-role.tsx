import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import type { SystemRole } from '@/shared/types/auth'

/**
 * Guard kiểm tra system role (ví dụ: ADMIN).
 * Phải đặt bên trong RequireAuth để đảm bảo user đã authenticated.
 *
 * Lưu ý: Guard frontend chỉ điều khiển UX, backend vẫn là điểm
 * thực thi authorization cuối cùng.
 */
export function RequireSystemRole({
  roles,
}: {
  /** Danh sách system roles được phép */
  roles: SystemRole[]
}) {
  const { hasSystemRole } = useAuth()

  const hasAccess = roles.some((role) => hasSystemRole(role))

  if (!hasAccess) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
