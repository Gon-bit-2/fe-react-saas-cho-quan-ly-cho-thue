import type { AxiosError } from 'axios'
import type { ApiErrorResponse, AppError, AppErrorKind } from '@/shared/types/errors'

/**
 * Kiểm tra xem error có phải là AxiosError với body ApiErrorResponse.
 * Dùng để phân biệt lỗi API có structure với lỗi network/unknown.
 */
export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  if (!error || typeof error !== 'object') return false
  const axiosError = error as AxiosError
  if (!axiosError.isAxiosError) return false

  const data = axiosError.response?.data
  if (!data || typeof data !== 'object') return false

  const body = data as Record<string, unknown>
  return (
    typeof body.statusCode === 'number' &&
    typeof body.code === 'string' &&
    typeof body.message === 'string' &&
    typeof body.requestId === 'string'
  )
}

/**
 * Trích xuất Retry-After từ response header (giây) → trả về milliseconds.
 * Trả null nếu không có hoặc không parse được.
 */
export function getRetryAfterMs(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null
  const axiosError = error as AxiosError
  if (!axiosError.isAxiosError || !axiosError.response) return null

  const retryAfter = axiosError.response.headers?.['retry-after']
  if (!retryAfter) return null

  const seconds = Number(retryAfter)
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000
  }
  return null
}

/**
 * Normalize bất kỳ error nào thành AppError thống nhất.
 * - AxiosError có body API → kind: 'api'
 * - AxiosError không response (network/timeout) → kind: 'network'
 * - Mọi thứ khác → kind: 'unknown'
 */
export function toAppError(error: unknown): AppError {
  // Trường hợp 1: Lỗi API có structure từ backend
  if (isApiError(error)) {
    const data = error.response!.data
    return {
      kind: 'api',
      status: data.statusCode,
      code: data.code,
      message: data.message,
      details: data.details ?? null,
      requestId: data.requestId,
      retryAfterMs: getRetryAfterMs(error),
      cause: error,
    }
  }

  // Trường hợp 2: AxiosError nhưng không có response (network, timeout, cancel)
  if (
    error &&
    typeof error === 'object' &&
    (error as AxiosError).isAxiosError
  ) {
    const axiosError = error as AxiosError
    const kind: AppErrorKind = 'network'
    return {
      kind,
      status: axiosError.response?.status ?? null,
      code: axiosError.code ?? null,
      message: axiosError.message || 'Không thể kết nối đến máy chủ',
      details: null,
      requestId: null,
      retryAfterMs: getRetryAfterMs(error),
      cause: error,
    }
  }

  // Trường hợp 3: Error thông thường
  if (error instanceof Error) {
    return {
      kind: 'unknown',
      status: null,
      code: null,
      message: error.message,
      details: null,
      requestId: null,
      retryAfterMs: null,
      cause: error,
    }
  }

  // Trường hợp 4: Hoàn toàn không xác định
  return {
    kind: 'unknown',
    status: null,
    code: null,
    message: String(error ?? 'Lỗi không xác định'),
    details: null,
    requestId: null,
    retryAfterMs: null,
    cause: error,
  }
}
