import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function SessionExpiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-6 text-amber-500">
        <span className="material-symbols-outlined text-[48px]">hourglass_empty</span>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Phiên đăng nhập đã hết hạn</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        Vì lý do bảo mật, phiên làm việc của bạn đã kết thúc do không hoạt động trong một khoảng thời gian. 
        Vui lòng đăng nhập lại để tiếp tục sử dụng.
      </p>
      <Link to="/auth/login">
        <Button size="lg" className="px-8">
          Đăng nhập lại
        </Button>
      </Link>
    </div>
  );
}
