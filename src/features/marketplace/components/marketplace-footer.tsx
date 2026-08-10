import { Link } from 'react-router'

export function MarketplaceFooter() {
  return (
    <footer className="bg-surface border-t border-surface-border py-12 mt-auto">
      <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <div className="font-display text-primary font-bold text-xl">
                Rental<span className="text-text-main">SaaS</span>
              </div>
            </Link>
            <p className="text-on-surface-variant font-body-md">
              Nền tảng quản lý và cho thuê bất động sản chuyên nghiệp, nhanh chóng, minh bạch và an toàn.
            </p>
          </div>
          
          <div>
            <h3 className="font-headline-sm text-text-main mb-4">Dành cho Khách thuê</h3>
            <ul className="space-y-2">
              <li><Link to="/rooms" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Tìm phòng</Link></li>
              <li><Link to="/about" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Giới thiệu</Link></li>
              <li><Link to="/help" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Trung tâm hỗ trợ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline-sm text-text-main mb-4">Dành cho Chủ nhà</h3>
            <ul className="space-y-2">
              <li><Link to="/dang-nhap" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Đăng nhập quản lý</Link></li>
              <li><Link to="/dang-ky" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Đăng ký chủ nhà</Link></li>
              <li><Link to="/pricing" className="text-on-surface-variant hover:text-primary font-body-md transition-colors">Bảng giá dịch vụ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline-sm text-text-main mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined text-sm">mail</span>
                support@rentalsaas.vn
              </li>
              <li className="flex items-center gap-2 text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined text-sm">call</span>
                1900 1234
              </li>
              <li className="flex items-center gap-2 text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Hà Nội, Việt Nam
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-surface-border text-center text-on-surface-variant font-body-md">
          <p>&copy; 2026 Rental SaaS. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
