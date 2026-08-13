import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

/**
 * Fatal error boundary — top-level, hiện fullscreen error page.
 * Bắt mọi lỗi render không được xử lý bởi error boundary con.
 */
export class FatalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log nhưng KHÔNG hiện stack/token/secret cho user
    console.error('[FatalErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-foreground text-2xl font-bold">Đã xảy ra lỗi nghiêm trọng</h1>
          <p className="text-muted-foreground">Ứng dụng gặp sự cố. Vui lòng tải lại trang.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            Tải lại trang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Route error boundary — per-route, hiện lỗi trong layout context.
 * Dùng làm errorElement trong route config.
 */
export class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h2 className="text-foreground text-xl font-semibold">Trang gặp lỗi</h2>
          <p className="text-muted-foreground">Không thể hiển thị nội dung. Thử tải lại trang.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-secondary text-secondary-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            Thử lại
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/** Error element dành cho React Router, tránh lộ stack trace và màn hình lỗi mặc định. */
export function RouteErrorPage() {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  useEffect(() => {
    console.error('[RouteErrorPage]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-foreground text-2xl font-bold">
        {isNotFound ? 'Không tìm thấy trang' : 'Trang gặp sự cố'}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {isNotFound
          ? 'Nội dung bạn tìm kiếm không tồn tại hoặc đã được gỡ.'
          : 'Không thể hiển thị nội dung lúc này. Vui lòng tải lại trang hoặc quay về trang chủ.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {!isNotFound && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            Tải lại trang
          </button>
        )}
        <Link
          to="/"
          className="border-border text-foreground rounded-md border px-4 py-2 text-sm font-medium"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
