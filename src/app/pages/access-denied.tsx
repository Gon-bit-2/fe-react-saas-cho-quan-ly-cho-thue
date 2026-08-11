import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

export function AccessDeniedPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
        <span className="material-symbols-outlined text-[48px]">block</span>
      </div>
      <h1 className="mb-4 text-4xl font-bold text-slate-900">403 - Lỗi truy cập</h1>
      <p className="mb-8 max-w-md text-lg text-slate-600">
        Bạn không có quyền truy cập vào trang này hoặc thực hiện hành động này. Vui lòng liên hệ với quản trị viên nếu
        bạn nghĩ đây là một sự nhầm lẫn.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Quay lại trang trước
        </Button>
        <Link to="/app">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    </div>
  )
}
