import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

/**
 * Guard kiểm tra user đã chọn tenant context.
 * Phải đặt bên trong RequireAuth.
 *
 * Kiểm tra:
 * - Có selectedMembership
 * - Membership status ACTIVE
 * - Tenant status ACTIVE
 */
export function RequireTenantContext() {
  const { selectedMembership } = useAuth()

  if (!selectedMembership) {
    // Chưa chọn tenant → redirect đến trang chọn tenant
    return <Navigate to="/account/select-tenant" replace />
  }

  if (
    selectedMembership.status !== 'ACTIVE' ||
    selectedMembership.tenant.status !== 'ACTIVE'
  ) {
    // Tenant hoặc membership không active → redirect chọn lại
    return <Navigate to="/account/select-tenant" replace />
  }

  return <Outlet />
}
