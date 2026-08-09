import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/shared/hooks/use-auth'

/**
 * Guard cho protected routes: yêu cầu user đã authenticated.
 * - Bootstrap → hiện loading (không redirect sớm)
 * - Anonymous/Expired → redirect /dang-nhap với returnUrl
 * - Authenticated → render children
 *
 * returnUrl được sanitize: chỉ chấp nhận internal path,
 * cấm external URL/protocol để chống open redirect.
 */
export function RequireAuth() {
  const { state } = useAuth()
  const location = useLocation()

  if (state === 'bootstrapping') {
    return <AuthLoading />
  }

  if (state === 'anonymous' || state === 'expired') {
    const returnUrl = sanitizeReturnUrl(
      location.pathname + location.search + location.hash,
    )
    return (
      <Navigate
        to={`/dang-nhap${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <Outlet />
}

/**
 * Sanitize return URL để chống open redirect.
 * Chỉ chấp nhận path bắt đầu bằng `/` và không chứa `//` hoặc protocol.
 */
function sanitizeReturnUrl(url: string): string | null {
  if (!url || !url.startsWith('/')) return null
  // Chặn // (protocol-relative) và scheme://
  if (url.startsWith('//') || /^\/[^/]*:/.test(url)) return null
  // Chặn javascript:, data:, vbscript: etc.
  if (/^[a-z]+:/i.test(url)) return null
  return url
}

/** Loading state khi đang kiểm tra session */
function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground animate-pulse">
        Đang xác thực...
      </div>
    </div>
  )
}
