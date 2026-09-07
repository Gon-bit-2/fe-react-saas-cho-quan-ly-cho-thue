import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { AlertTriangle, Info } from 'lucide-react'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Hộp thoại xác nhận hành động theo tiêu chuẩn DESIGN.md (mục 5.4 - ConfirmDialog).
 * Dùng cho các hành động nguy hiểm, xóa dữ liệu hoặc chuyển trạng thái không thể hoàn tác.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive'

  /**
   * Xử lý khi người dùng nhấn nút xác nhận trong hộp thoại
   */
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-slate-200 p-6 sm:max-w-md shadow-xl">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-10 rounded-full flex items-center justify-center shrink-0',
                isDestructive
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-primary/15 text-primary'
              )}
            >
              {isDestructive ? <AlertTriangle className="size-5" /> : <Info className="size-5" />}
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 leading-snug">
              {title}
            </AlertDialogTitle>
          </div>

          {description && (
            <AlertDialogDescription className="text-sm text-slate-600 pl-13">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading} className="rounded-xl border-slate-200">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'rounded-xl font-medium',
              isDestructive
                ? buttonVariants({ variant: 'destructive' })
                : buttonVariants({ variant: 'default' })
            )}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
