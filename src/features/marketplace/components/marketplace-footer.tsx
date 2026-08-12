import { useState } from 'react'
import { Link } from 'react-router'
import { QrCodeModal } from './qr-code-modal'
import { LanguageDropdown } from './language-dropdown'

/**
 * Footer cho trang Marketplace public.
 * Chứa liên kết khám phá, hỗ trợ, nút QR Code và đổi ngôn ngữ.
 */
export function MarketplaceFooter() {
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)

  return (
    <footer className="bg-surface border-t border-surface-border py-12 mt-auto">
      <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 pr-12">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">home</span>
              </div>
            </Link>
            <p className="text-on-surface-variant font-body-sm max-w-sm">
              Nền tảng tìm kiếm và quản lý cho thuê bất động sản hiện đại, an toàn và minh bạch.
            </p>
          </div>
          
          <div>
            <h3 className="font-label-sm text-text-main mb-6 uppercase tracking-wider">Khám phá</h3>
            <ul className="space-y-4">
              <li><Link to="/phong?type=PHONG_TRO" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Phòng trọ</Link></li>
              <li><Link to="/phong?type=CAN_HO" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Căn hộ</Link></li>
              <li><Link to="/phong?type=NHA_NGUYEN_CAN" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Nhà nguyên căn</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-label-sm text-text-main mb-6 uppercase tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-4">
              <li><Link to="/help" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link to="/terms" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/privacy" className="text-on-surface-variant hover:text-primary font-body-sm transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-6 border-t border-surface-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-on-surface-variant font-body-sm">
            &copy; 2024 Rental SaaS. Mọi quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4 text-on-surface-variant relative">
            {/* Nút Quét QR Code — mở modal hiển thị QR */}
            <button
              className="hover:text-primary transition-colors flex items-center justify-center"
              onClick={() => setIsQrOpen(true)}
              aria-label="Quét mã QR"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </button>
            {/* Nút Đổi ngôn ngữ — mở dropdown chọn ngôn ngữ */}
            <div className="relative">
              <button
                className="hover:text-primary transition-colors flex items-center justify-center"
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Đổi ngôn ngữ"
              >
                <span className="material-symbols-outlined text-[20px]">language</span>
              </button>
              <LanguageDropdown isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QrCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </footer>
  )
}
