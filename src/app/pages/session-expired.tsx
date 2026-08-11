import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

export function SessionExpiredPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 text-amber-500">
        <span className="material-symbols-outlined text-[48px]">hourglass_empty</span>
      </div>
      <h1 className="mb-4 text-4xl font-bold text-slate-900">Phiên đăng nhập đã hết hạn</h1>
      <p className="mb-8 max-w-md text-lg text-slate-600">
        Vì lý do bảo mật, phiên làm việc của bạn đã kết thúc do không hoạt động trong một khoảng thời gian. Vui lòng
        đăng nhập lại để tiếp tục sử dụng.
      </p>
      <Link to="/dang-nhap">
        <Button size="lg" className="px-8">
          Đăng nhập lại
        </Button>
      </Link>
    </div>
  )
}
