import { useEffect, useRef } from 'react'

/**
 * Dropdown chọn ngôn ngữ.
 * Hiện tại chỉ hỗ trợ Tiếng Việt; các ngôn ngữ khác hiển thị "Sắp ra mắt".
 */
export function LanguageDropdown({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  /** Đóng dropdown khi click bên ngoài */
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-white border border-slate-100 shadow-lg overflow-hidden z-50"
    >
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
            lang.active
              ? 'bg-primary/5 text-primary'
              : 'text-slate-400 cursor-not-allowed hover:bg-slate-50'
          }`}
          disabled={!lang.active}
          onClick={() => {
            if (lang.active) onClose()
          }}
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="font-label-md text-sm flex-1">{lang.name}</span>
          {lang.active ? (
            <span className="material-symbols-outlined text-[16px] text-primary">check</span>
          ) : (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
              Sắp ra mắt
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/** Danh sách ngôn ngữ hỗ trợ */
const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', active: true },
  { code: 'en', name: 'English', flag: '🇺🇸', active: false },
]
