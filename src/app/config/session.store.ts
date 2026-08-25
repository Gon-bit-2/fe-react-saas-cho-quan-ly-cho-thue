import type { SessionState, TokenPair } from '@/shared/types/auth'

/**
 * Session store độc lập React — quản lý token và trạng thái session.
 *
 * - Access token: chỉ lưu trong memory (closure), không persist
 * - Refresh token: lưu trong localStorage (giữ đăng nhập qua các tab)
 * - Selected tenant ID: lưu trong localStorage
 * - State: broadcast qua event listeners
 *
 * Thiết kế này đảm bảo:
 * - Token không bao giờ xuất hiện lộ liễu, chỉ refresh token được lưu localStorage
 * - Vẫn giữ được session khi reload trang
 * - Axios interceptor truy cập token không qua React render cycle
 */

// ─── Constants ──────────────────────────────────────────────────

const STORAGE_KEY_REFRESH_TOKEN = 'session:refreshToken'
const STORAGE_KEY_TENANT_ID = 'session:selectedTenantId'

// ─── Internal State ─────────────────────────────────────────────

/** Access token chỉ tồn tại trong memory — không persist */
let accessToken: string | null = null

/** Trạng thái session hiện tại */
let currentState: SessionState = 'bootstrapping'

/** Danh sách listener theo dõi thay đổi state */
type StateListener = (state: SessionState) => void
const listeners = new Set<StateListener>()

// ─── Event Emitter cho session-expired ──────────────────────────

type SessionExpiredListener = () => void
const expiredListeners = new Set<SessionExpiredListener>()

// ─── Internal Helpers ───────────────────────────────────────────

/** Thông báo tất cả listener khi state thay đổi */
function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener(currentState)
    } catch {
      // Listener lỗi không ảnh hưởng các listener khác
    }
  }
}

// ─── Public API ─────────────────────────────────────────────────

/** Lấy access token hiện tại (memory only) */
export function getAccessToken(): string | null {
  return accessToken
}

/** Lấy refresh token từ localStorage */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN)
  } catch {
    return null
  }
}

/**
 * Lưu cặp token mới.
 * Access token vào memory, refresh token vào localStorage.
 * Gọi sau khi login/refresh/google session thành công.
 */
export function setTokenPair(pair: TokenPair): void {
  accessToken = pair.accessToken
  try {
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, pair.refreshToken)
  } catch {
    // localStorage không khả dụng (private browsing trên một số browser cũ)
  }
}

/**
 * Xóa toàn bộ session: token memory + localStorage.
 * Gọi khi logout, refresh thất bại, hoặc session expired.
 */
export function clearSession(): void {
  accessToken = null
  try {
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEY_TENANT_ID)
  } catch {
    // Ignore
  }
}

/** Lấy trạng thái session hiện tại */
export function getState(): SessionState {
  return currentState
}

/** Cập nhật trạng thái session và thông báo listeners */
export function setState(state: SessionState): void {
  if (currentState === state) return
  currentState = state
  notifyListeners()
}

/**
 * Đăng ký listener theo dõi thay đổi state.
 * Trả về hàm unsubscribe.
 */
export function subscribe(listener: StateListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// ─── Tenant Selection ───────────────────────────────────────────

/** Lấy tenant ID đang chọn từ localStorage */
export function getSelectedTenantId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TENANT_ID)
    if (!raw) return null
    const id = Number(raw)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

/** Lưu tenant ID đang chọn */
export function setSelectedTenantId(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_TENANT_ID, String(id))
  } catch {
    // Ignore
  }
}

/** Xóa tenant ID đang chọn */
export function clearSelectedTenant(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TENANT_ID)
  } catch {
    // Ignore
  }
}

// ─── Session Expired Event ──────────────────────────────────────

/** Phát sự kiện session-expired (gọi từ Axios interceptor khi refresh thất bại) */
export function emitSessionExpired(): void {
  setState('expired')
  for (const listener of expiredListeners) {
    try {
      listener()
    } catch {
      // Listener lỗi không ảnh hưởng các listener khác
    }
  }
}

/**
 * Đăng ký listener cho sự kiện session-expired.
 * Trả về hàm unsubscribe.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  expiredListeners.add(listener)
  return () => {
    expiredListeners.delete(listener)
  }
}
