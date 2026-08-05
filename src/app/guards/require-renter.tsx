import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

/**
 * Guard kiểm tra user có RenterProfile.
 * Dùng cho các route renter self-service.
 * Phải đặt bên trong RequireAuth.
 */
export function RequireRenter() {
  const { profile } = useAuth()

  if (!profile?.renterProfile) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
