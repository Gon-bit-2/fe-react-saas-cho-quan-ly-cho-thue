import type { AxiosError, AxiosRequestConfig } from 'axios'
import { apiClient } from './axios-client'

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData

type CancelablePromise<T> = Promise<T> & { cancel: () => void }

/**
 * Shared Orval transport. It reuses authentication, tenant and refresh
 * interceptors from apiClient while preserving generated-query cancellation.
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): CancelablePromise<T> => {
  const controller = new AbortController()
  const promise = apiClient({
    ...config,
    ...options,
    signal: options?.signal ?? controller.signal,
  }).then(({ data }) => data as T) as CancelablePromise<T>

  promise.cancel = () => controller.abort()
  return promise
}
