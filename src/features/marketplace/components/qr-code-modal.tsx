import { useEffect, useRef } from 'react'

/**
 * Modal hiển thị QR Code tĩnh liên kết đến website.
 * Sử dụng SVG inline thay vì thư viện bên ngoài.
 */
export function QrCodeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  /** Đồng bộ trạng thái open/close với <dialog> native */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  /** Đóng khi click backdrop */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] m-auto w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-0 shadow-2xl backdrop:bg-black/40"
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-slate-900 text-lg">Quét mã QR</h2>
          <button
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* QR Code placeholder — hiển thị icon lớn kèm hướng dẫn */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-[80px] text-primary/60">
              qr_code_2
            </span>
          </div>
          <p className="font-body-sm text-slate-500 text-center max-w-[260px]">
            Quét mã QR bằng camera điện thoại để truy cập nhanh vào{' '}
            <span className="font-semibold text-primary">RentalSaaS</span>
          </p>
          <p className="font-body-sm text-slate-400 text-center text-xs">rentalsaas.vn</p>
        </div>
      </div>
    </dialog>
  )
}
