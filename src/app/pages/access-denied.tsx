import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 text-red-500">
        <span className="material-symbols-outlined text-[48px]">block</span>
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">403 - Lỗi truy cập</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        Bạn không có quyền truy cập vào trang này hoặc thực hiện hành động này. 
        Vui lòng liên hệ với quản trị viên nếu bạn nghĩ đây là một sự nhầm lẫn.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Quay lại trang trước
        </Button>
        <Link to="/app">
          <Button>
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
