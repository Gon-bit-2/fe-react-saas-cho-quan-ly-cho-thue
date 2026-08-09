import { Link } from 'react-router'

/**
 * Trang session expired.
 * Hiện khi refresh token thất bại và session bị xóa.
 */
export function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-foreground">
        Phiên đăng nhập đã hết hạn
      </h1>
      <p className="text-muted-foreground">
        Vui lòng đăng nhập lại để tiếp tục sử dụng.
      </p>
      <Link
        to="/dang-nhap"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Đăng nhập lại
      </Link>
    </div>
  )
}
