import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { getStatusVisual, type StatusVisual } from '@/shared/constants/status-config'
import { cn } from '@/shared/lib/utils'

export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  status: string
  statusMap?: Record<string, StatusVisual>
  configMap?: Record<string, StatusVisual>
  fallbackLabel?: string
  icon?: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
}

export function StatusBadge({ status, statusMap, configMap, fallbackLabel, icon, className, size, ...props }: StatusBadgeProps) {
  const map = statusMap || configMap || {}
  const visual = getStatusVisual(map, status, fallbackLabel)

  const toneClasses = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-sm',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-sm',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-sm',
    info: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-none shadow-sm',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-none shadow-sm',
  }

  return (
    <Badge className={cn(toneClasses[visual.tone] || toneClasses.neutral, size === 'sm' && 'text-[11px] px-2 py-0.5', className)} {...props}>
      {icon && <span className="mr-1 inline-flex items-center">{icon}</span>}
      {visual.label}
    </Badge>
  )
}
