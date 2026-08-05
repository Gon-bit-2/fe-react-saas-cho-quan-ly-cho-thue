import type { AxiosError, AxiosRequestConfig } from 'axios'
import { AXIOS_INSTANCE } from './axios-client'
import type { ApiErrorResponse } from '@/shared/types/errors'

/**
 * Custom Axios mutator cho Orval.
 *
 * Orval gọi hàm này thay vì gọi trực tiếp axios.
 * Hàm trả trực tiếp response.data (unwrap AxiosResponse)
 * và type error là AxiosError<ApiErrorResponse>.
 *
 * @see https://orval.dev/docs/guides/custom-axios/
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = new AbortController()

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    signal: source.signal,
  }).then(({ data }) => data as T)

  // Gắn cancel method để TanStack Query có thể hủy request
  // khi component unmount hoặc query bị invalidate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(promise as any).cancel = () => {
    source.abort('Query was cancelled')
  }

  return promise
}

/** Type error mặc định cho tất cả Orval generated hooks */
export type ErrorType<T = ApiErrorResponse> = AxiosError<T>

export default customInstance
