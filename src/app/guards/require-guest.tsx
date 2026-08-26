import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'
import { getPostLoginPath } from '@/shared/lib/auth-navigation'

/**
 * Guard cho guest-only routes (login, register, forgot-password).
 * Nếu đã authenticated → redirect về trang chính.
 * Nếu đang bootstrap → hiện loading, không redirect sớm.
 */
export function RequireGuest() {
  const { state, profile } = useAuth()
  const location = useLocation()

  if (state === 'bootstrapping') {
    return <GuestLoading />
  }

  if (state === 'authenticated') {
    // Redirect về trang trước đó hoặc về home
    const returnUrl = (location.state as { from?: string })?.from ?? (profile ? getPostLoginPath(profile) : '/')
    return <Navigate to={returnUrl} replace />
  }

  return <Outlet />
}

/** Loading state khi đang kiểm tra session */
function GuestLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground animate-pulse">
        Đang kiểm tra phiên đăng nhập...
      </div>
    </div>
  )
}
