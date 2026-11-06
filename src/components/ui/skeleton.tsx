import * as React from "react"
import { cn } from "@/shared/lib/utils"

/**
 * Component Skeleton dùng làm placeholder hiệu ứng nhấp nháy (shimmer)
 * trong khi đang chờ tải dữ liệu từ API (Table, Card, Text, Avatar).
 */
function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted/70 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
