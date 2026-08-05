import { QueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { getRetryAfterMs } from '@/shared/lib/errors'

/**
 * Các HTTP status code KHÔNG nên retry.
 * - 400: Bad request (lỗi validation, gửi lại cũng sai)
 * - 401: Unauthorized (đã xử lý bởi Axios interceptor)
 * - 403: Forbidden (không có quyền, retry vô nghĩa)
 * - 404: Not found (resource không tồn tại)
 * - 409: Conflict (cần user action, không auto retry)
 */
const NON_RETRYABLE_STATUS = new Set([400, 401, 403, 404, 409])

/**
 * Custom retry function cho queries.
 * - Network/5xx: retry tối đa 2 lần
 * - 400/401/403/404/409: KHÔNG retry
 * - 429: retry tối đa 1 lần, delay theo Retry-After header
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/query-retries
 */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  // Kiểm tra AxiosError
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status

    // Các status không retry
    if (status && NON_RETRYABLE_STATUS.has(status)) {
      return false
    }

    // 429 Too Many Requests: retry tối đa 1 lần
    if (status === 429) {
      return failureCount < 1
    }

    // Network error hoặc 5xx: retry tối đa 2 lần
    if (!status || status >= 500) {
      return failureCount < 2
    }
  }

  // Lỗi không phải Axios (edge case): retry 1 lần
  return failureCount < 1
}

/**
 * Custom retry delay.
 * - 429: dùng Retry-After header nếu có
 * - Còn lại: exponential backoff (1s, 2s, 4s...)
 */
function retryDelay(failureCount: number, error: unknown): number {
  // Kiểm tra Retry-After cho 429
  const retryAfterMs = getRetryAfterMs(error)
  if (retryAfterMs !== null) {
    return retryAfterMs
  }

  // Exponential backoff: 1s, 2s, 4s...
  return Math.min(1000 * 2 ** failureCount, 30_000)
}

/**
 * QueryClient singleton cho toàn bộ ứng dụng.
 *
 * Chính sách:
 * - staleTime 30s: giảm refetch thừa
 * - refetchOnReconnect + refetchOnWindowFocus: đồng bộ khi tab trở lại
 * - Mutation không retry (user sẽ thử lại manually)
 * - Query retry theo custom matrix ở trên
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: shouldRetryQuery,
      retryDelay,
    },
    mutations: {
      retry: false,
    },
  },
})

/**
 * Cancel tất cả queries đang chạy rồi xóa cache.
 * Gọi khi logout hoặc tenant switch để đảm bảo
 * không có data leak giữa các session/tenant.
 */
export async function cancelAndClearQueryCache(): Promise<void> {
  await queryClient.cancelQueries()
  queryClient.clear()
}
