import { Link } from 'react-router'

/**
 * Trang 404 Not Found.
 * Hiện khi URL không khớp bất kỳ route nào.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-lg text-muted-foreground">
        Trang bạn tìm kiếm không tồn tại.
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
