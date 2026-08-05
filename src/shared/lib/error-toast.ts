import axios from 'axios'
import { toast } from 'sonner'
import { toAppError } from '@/shared/lib/errors'

/**
 * Hiện toast lỗi cho mutation failures.
 *
 * Quy tắc:
 * - Không toast cho cancel errors (user navigate away)
 * - Không toast nếu feature đã xử lý riêng
 * - Không hiện stack, token, OTP hoặc provider detail
 * - requestId chỉ hiện trong phần mở rộng
 *
 * @param error - Error từ mutation onError callback
 * @param options - Tùy chọn bổ sung
 */
export function showMutationError(
  error: unknown,
  options?: { skipCodes?: string[] },
): void {
  // Không toast cho request bị cancel
  if (axios.isCancel(error)) return

  const appError = toAppError(error)

  // Cho phép feature bỏ qua một số error codes
  if (options?.skipCodes?.includes(appError.code ?? '')) return

  // Không toast 401 — Axios interceptor đã xử lý (redirect/session-expired)
  if (appError.status === 401) return

  const description = appError.requestId
    ? `Mã lỗi: ${appError.code ?? 'UNKNOWN'} • ID: ${appError.requestId}`
    : undefined

  toast.error(appError.message, {
    description,
    duration: appError.status === 429 ? (appError.retryAfterMs ?? 5000) : 5000,
  })
}
