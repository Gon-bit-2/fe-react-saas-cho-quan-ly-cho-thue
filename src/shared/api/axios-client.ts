import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    tenantId?: string | number
  }
}
import { env } from '@/app/config/env.config'
import {
  getAccessToken,
  getRefreshToken,
  setTokenPair,
  clearSession,
  emitSessionExpired,
} from '@/app/config/session.store'
import type { TokenPair } from '@/shared/types/auth'
import type { ApiErrorResponse } from '@/shared/types/errors'

// ─── Refresh Client (không interceptor) ─────────────────────────

/**
 * Axios instance riêng cho refresh token.
 * Không có interceptor để tránh vòng lặp vô tận khi refresh cũng bị 401.
 */
const refreshClient = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
})

// ─── Main API Client ────────────────────────────────────────────

/**
 * Axios instance chính cho toàn bộ API calls.
 * Request interceptor gắn Bearer token và x-request-id.
 * Response interceptor xử lý 401 với shared refresh promise.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Các endpoint không cần refresh khi bị 401 ─────────────────

/**
 * Danh sách endpoint mà khi trả 401, không nên cố refresh token.
 * Đây là các endpoint public hoặc chính endpoint refresh.
 */
const SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/send-otp',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/google/session',
  '/auth/refresh-token',
] as const

/** Kiểm tra URL có thuộc danh sách skip refresh không */
function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return false
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path))
}

// ─── UUID v4 generator ──────────────────────────────────────────

/** Sinh UUID v4 cho x-request-id header */
function generateRequestId(): string {
  return crypto.randomUUID()
}

// ─── Request Interceptor ────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  // Gắn Bearer access token nếu có
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Gắn x-request-id để đối soát log với backend
  config.headers['x-request-id'] = generateRequestId()

  // Gắn x-tenant-id nếu caller truyền config.tenantId (chúng ta tự quy ước khi viết thủ công)
  const extendedConfig = config as InternalAxiosRequestConfig & { tenantId?: string | number }
  if (extendedConfig.tenantId) {
    config.headers['x-tenant-id'] = extendedConfig.tenantId
  }

  return config
})

// ─── Response Interceptor: 401 Refresh Logic ────────────────────

/**
 * Shared refresh promise: khi nhiều request đồng thời nhận 401,
 * chỉ gọi refresh MỘT lần. Các request khác đợi cùng promise.
 */
let refreshPromise: Promise<TokenPair> | null = null

/**
 * Thực hiện refresh token rotation.
 * Dùng refreshClient (không interceptor) để tránh vòng lặp.
 */
async function doRefresh(): Promise<TokenPair> {
  const currentRefreshToken = getRefreshToken()
  if (!currentRefreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await refreshClient.post<TokenPair>(
    '/auth/refresh-token',
    { refreshToken: currentRefreshToken },
  )

  return response.data
}

apiClient.interceptors.response.use(
  // Success: pass through
  (response) => response,

  // Error handler
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined

    // Điều kiện để thử refresh:
    // 1. HTTP 401
    // 2. Chưa retry lần nào (tránh vòng lặp)
    // 3. Không phải endpoint thuộc skip list
    // 4. Có refresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !shouldSkipRefresh(originalRequest.url) &&
      getRefreshToken()
    ) {
      originalRequest._retried = true

      try {
        // Dùng shared promise: request đầu tiên tạo promise,
        // các request sau dùng chung promise đó
        if (!refreshPromise) {
          refreshPromise = doRefresh().finally(() => {
            refreshPromise = null
          })
        }

        const tokenPair = await refreshPromise

        // Thay token pair atomically
        setTokenPair(tokenPair)

        // Replay request gốc với token mới
        originalRequest.headers.Authorization = `Bearer ${tokenPair.accessToken}`
        return apiClient(originalRequest)
      } catch {
        // Refresh thất bại: phát session-expired, xóa session
        clearSession()
        emitSessionExpired()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

/**
 * Export AXIOS_INSTANCE cho các hook thủ công.
 */
export const AXIOS_INSTANCE = apiClient
