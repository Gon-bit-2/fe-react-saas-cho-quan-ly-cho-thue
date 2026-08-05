import { Link } from 'react-router'

/**
 * Trang 403 Forbidden.
 * Hiện khi user không đủ quyền truy cập route.
 */
export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-foreground">403</h1>
      <p className="text-lg text-muted-foreground">
        Bạn không có quyền truy cập trang này.
      </p>
      <Link
        to="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
