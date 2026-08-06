import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { apiClient } from '@/shared/api/axios-client'
import { useAuth } from '@/shared/hooks/use-auth'
import type { TokenPair, UserProfile } from '@/shared/types/auth'

/**
 * Google OAuth callback handler.
 *
 * Luồng:
 * 1. Google redirect về /auth/google/callback?sessionToken=xxx
 * 2. Component consume sessionToken một lần qua POST /auth/google/session
 * 3. Xóa sessionToken khỏi URL
 * 4. Establish session (lưu token, fetch profile) → redirect
 *
 * sessionToken chỉ dùng một lần — nếu reload sẽ thất bại.
 */
export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const sessionToken = searchParams.get('sessionToken')
  const [error, setError] = useState<string | null>(
    sessionToken ? null : 'Không tìm thấy session token từ Google.',
  )
  const processedRef = useRef(false)

  useEffect(() => {
    // Chỉ xử lý một lần (StrictMode gọi effect 2 lần)
    if (processedRef.current) return
    processedRef.current = true

    if (!sessionToken) return

    void handleGoogleSession(sessionToken)

    async function handleGoogleSession(token: string) {
      try {
        // Đổi sessionToken lấy token pair
        const tokenResponse = await apiClient.post<TokenPair>(
          '/auth/google/session',
          { sessionToken: token },
        )

        // Fetch profile
        const profileResponse = await apiClient.get<UserProfile>(
          '/auth/profile',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.accessToken}`,
            },
          },
        )

        // Establish session
        establishSession(tokenResponse.data, profileResponse.data)

        // Xóa sessionToken khỏi URL và redirect
        navigate('/account', { replace: true })
      } catch {
        setError('Xác thực Google thất bại. Vui lòng thử lại.')
      }
    }
  }, [sessionToken, searchParams, navigate, establishSession])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Quay lại đăng nhập
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground animate-pulse">
        Đang xác thực với Google...
      </div>
    </div>
  )
}
