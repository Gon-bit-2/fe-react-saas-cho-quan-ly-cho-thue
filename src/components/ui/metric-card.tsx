import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface MetricCardProps {
  /** Tiêu đề số liệu */
  title: string
  /** Giá trị hiển thị chính (số lượng, tổng tiền...) */
  value: React.ReactNode
  /** Ngữ cảnh phụ, mô tả hoặc tỷ lệ so sánh */
  description?: React.ReactNode
  /** Alias tương thích cho description */
  subtitle?: React.ReactNode
  /** Biểu tượng minh họa */
  icon?: React.ReactNode
  /** Tông màu của biểu tượng: blue, emerald, amber, rose, purple, slate */
  tone?: "blue" | "emerald" | "amber" | "rose" | "purple" | "slate"
  /** Alias tương thích cho tone */
  color?: "blue" | "emerald" | "amber" | "rose" | "purple" | "slate" | "info" | "success" | "warning" | "danger" | "neutral"
  /** Tùy biến class wrapper */
  className?: string
}

const toneMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
}

const colorToTone: Record<string, keyof typeof toneMap> = {
  info: "blue",
  success: "emerald",
  warning: "amber",
  danger: "rose",
  neutral: "slate",
  blue: "blue",
  emerald: "emerald",
  amber: "amber",
  rose: "rose",
  purple: "purple",
  slate: "slate",
}

/**
 * Thẻ hiển thị KPI tổng quan trên đầu trang cho chủ trọ,
 * định dạng font-mono tabular-nums cho các con số theo DESIGN.md.
 */
export function MetricCard({
  title,
  value,
  description,
  subtitle,
  icon,
  tone,
  color,
  className,
}: MetricCardProps) {
  const displayDescription = description ?? subtitle
  const selectedTone = tone || (color ? colorToTone[color] : undefined) || "blue"
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              toneMap[selectedTone]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </div>
        {displayDescription && (
          <div className="mt-1 flex items-center text-xs text-slate-500">
            {displayDescription}
          </div>
        )}
      </div>
    </div>
  )
}
