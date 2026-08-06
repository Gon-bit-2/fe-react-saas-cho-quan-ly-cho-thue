import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { apiClient } from '@/shared/api/axios-client'
import {
  getRefreshToken,
  setTokenPair,
  clearSession,
  setState as setStoreState,
  getSelectedTenantId,
  setSelectedTenantId,
  clearSelectedTenant,
  onSessionExpired,
} from '@/app/config/session.store'
import { cancelAndClearQueryCache } from '@/app/config/query-client'
import type {
  SessionContextValue,
  SessionState,
  TenantMembership,
  TokenPair,
  UserProfile,
  SystemRole,
  TenantRole,
} from '@/shared/types/auth'

// ─── Context ────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<SessionContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────────

/**
 * AuthProvider: quản lý session lifecycle.
 *
 * Bootstrap flow (chạy trước khi protected route render):
 * 1. Kiểm tra refresh token trong sessionStorage
 * 2. Nếu có → refresh token → fetch profile → validate tenant → authenticated
 * 3. Nếu không → anonymous
 * 4. Nếu lỗi → xóa session → anonymous
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setStateLocal] = useState<SessionState>('bootstrapping')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedMembership, setSelectedMembership] =
    useState<TenantMembership | null>(null)
  const bootstrappedRef = useRef(false)

  /** Đồng bộ state giữa React state và session store */
  const setState = useCallback((newState: SessionState) => {
    setStateLocal(newState)
    setStoreState(newState)
  }, [])

  // ─── Bootstrap ────────────────────────────────────────────

  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true

    void bootstrap()

    async function bootstrap() {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        setState('anonymous')
        return
      }

      try {
        // Refresh token để lấy cặp token mới
        const tokenResponse = await apiClient.post<TokenPair>(
          '/auth/refresh-token',
          { refreshToken },
        )
        setTokenPair(tokenResponse.data)

        // Fetch profile
        const profileResponse =
          await apiClient.get<UserProfile>('/auth/profile')
        const userProfile = profileResponse.data
        setProfile(userProfile)

        // Validate selected tenant
        const savedTenantId = getSelectedTenantId()
        if (savedTenantId) {
          const membership = findActiveMembership(
            userProfile,
            savedTenantId,
          )
          if (membership) {
            setSelectedMembership(membership)
          } else {
            // Tenant đã lưu không còn valid → xóa
            clearSelectedTenant()
          }
        }

        setState('authenticated')
      } catch {
        // Refresh thất bại → xóa session, về anonymous
        clearSession()
        setState('anonymous')
      }
    }
  }, [setState])

  // ─── Lắng nghe session-expired từ Axios interceptor ──────

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setProfile(null)
      setSelectedMembership(null)
      setState('expired')
      void cancelAndClearQueryCache()
    })
    return unsubscribe
  }, [setState])

  // ─── Actions ──────────────────────────────────────────────

  /** Thiết lập session sau login/google thành công */
  const establishSession = useCallback(
    (tokenPair: TokenPair, userProfile: UserProfile) => {
      setTokenPair(tokenPair)
      setProfile(userProfile)

      // Tự động chọn tenant nếu chỉ có 1
      const activeMembers = userProfile.tenantMembers.filter(
        (m) => m.status === 'ACTIVE' && m.tenant.status === 'ACTIVE',
      )
      if (activeMembers.length === 1) {
        setSelectedMembership(activeMembers[0])
        setSelectedTenantId(activeMembers[0].tenantId)
      }

      setState('authenticated')
    },
    [setState],
  )

  /** Đăng xuất */
  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken })
      }
    } catch {
      // Logout API thất bại vẫn xóa session local
    } finally {
      clearSession()
      setProfile(null)
      setSelectedMembership(null)
      setState('anonymous')
      await cancelAndClearQueryCache()
    }
  }, [setState])

  /** Chọn tenant: validate ACTIVE, cancel requests, clear cache */
  const selectTenant = useCallback(
    (tenantId: number) => {
      if (!profile) return

      const membership = findActiveMembership(profile, tenantId)
      if (!membership) {
        throw new Error(
          `Tenant ${tenantId} không hợp lệ hoặc không còn hoạt động`,
        )
      }

      // Cancel pending requests và clear cache của tenant cũ
      void cancelAndClearQueryCache()

      setSelectedMembership(membership)
      setSelectedTenantId(tenantId)
    },
    [profile],
  )

  /** Kiểm tra system role */
  const hasSystemRole = useCallback(
    (role: SystemRole) => {
      return profile?.systemRole === role
    },
    [profile],
  )

  /** Kiểm tra tenant role trong selected membership */
  const hasTenantRole = useCallback(
    (role: TenantRole) => {
      return selectedMembership?.role.name === role
    },
    [selectedMembership],
  )

  /** Kiểm tra permission code trong selected membership */
  const hasPermission = useCallback(
    (code: string) => {
      if (!selectedMembership) return false
      return selectedMembership.role.permissions.some(
        (p) => p.permission.code === code,
      )
    },
    [selectedMembership],
  )

  // ─── Context Value ────────────────────────────────────────

  const contextValue = useMemo<SessionContextValue>(
    () => ({
      state,
      profile,
      selectedMembership,
      establishSession,
      logout,
      selectTenant,
      hasSystemRole,
      hasTenantRole,
      hasPermission,
    }),
    [
      state,
      profile,
      selectedMembership,
      establishSession,
      logout,
      selectTenant,
      hasSystemRole,
      hasTenantRole,
      hasPermission,
    ],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Tìm membership ACTIVE trong tenant ACTIVE.
 * Chỉ chấp nhận membership và tenant đều ACTIVE.
 */
function findActiveMembership(
  profile: UserProfile,
  tenantId: number,
): TenantMembership | null {
  return (
    profile.tenantMembers.find(
      (m) =>
        m.tenantId === tenantId &&
        m.status === 'ACTIVE' &&
        m.tenant.status === 'ACTIVE',
    ) ?? null
  )
}
