import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Fatal error boundary — top-level, hiện fullscreen error page.
 * Bắt mọi lỗi render không được xử lý bởi error boundary con.
 */
export class FatalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
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
          <h1 className="text-2xl font-bold text-foreground">
            Đã xảy ra lỗi nghiêm trọng
          </h1>
          <p className="text-muted-foreground">
            Ứng dụng gặp sự cố. Vui lòng tải lại trang.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
export class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
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
          <h2 className="text-xl font-semibold text-foreground">
            Trang gặp lỗi
          </h2>
          <p className="text-muted-foreground">
            Không thể hiển thị nội dung. Thử tải lại trang.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
          >
            Thử lại
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
