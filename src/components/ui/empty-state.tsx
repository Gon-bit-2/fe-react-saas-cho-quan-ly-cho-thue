import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface EmptyStateProps {
  /** Biểu tượng minh họa cho trạng thái rỗng (nhận JSX element hoặc React component) */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  /** Tiêu đề chính thông báo */
  title: string
  /** Mô tả chi tiết hoặc gợi ý hành động */
  description?: string
  /** Nút hành động kêu gọi (CTA) nếu có */
  action?: React.ReactNode
  /** Tùy biến class container */
  className?: string
}

/**
 * Component EmptyState hiển thị khi danh sách chưa có dữ liệu
 * hoặc bộ lọc không tìm thấy kết quả phù hợp, tuân thủ DESIGN.md mục 5.4.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) return icon
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComp = icon as React.ComponentType<{ className?: string }>
      return <IconComp className="h-7 w-7" />
    }
    return icon as React.ReactNode
  }

  return (
    <div
      className={cn(
        "flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-xs ring-8 ring-slate-50">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
