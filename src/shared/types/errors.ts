/**
 * Shape lỗi chuẩn từ backend API.
 * Khớp với ApiErrorResponse schema trong OpenAPI.
 * @see FE_INTEGRATION.md#5-error-response
 */
export interface ApiErrorResponse {
  readonly statusCode: number
  readonly code: string
  readonly message: string
  readonly details?: unknown
  readonly timestamp: string
  readonly path: string
  readonly requestId: string
}

/**
 * Phân loại nguồn gốc lỗi để UI xử lý phù hợp.
 * - network: mất kết nối, timeout, DNS failure
 * - api: server trả HTTP error có body JSON
 * - unknown: lỗi không xác định (bug, runtime error)
 */
export type AppErrorKind = 'network' | 'api' | 'unknown'

/**
 * Lỗi đã chuẩn hóa cho toàn bộ ứng dụng.
 * Mọi lỗi (AxiosError, Error, unknown) đều được normalize về dạng này
 * để UI có thể xử lý thống nhất.
 */
export interface AppError {
  readonly kind: AppErrorKind
  readonly status: number | null
  readonly code: string | null
  readonly message: string
  readonly details: unknown
  readonly requestId: string | null
  readonly retryAfterMs: number | null
  readonly cause: unknown
}
