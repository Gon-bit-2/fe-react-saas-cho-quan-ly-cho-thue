import { useContext } from 'react'
import { AuthContext } from '@/app/providers/auth-provider'
import type { SessionContextValue } from '@/shared/types/auth'

/**
 * Hook để truy cập auth context.
 * Phải dùng bên trong AuthProvider, throw nếu dùng ngoài.
 */
export function useAuth(): SessionContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(
      'useAuth phải được sử dụng bên trong AuthProvider. ' +
        'Kiểm tra lại cây component — AuthProvider phải wrap toàn bộ app.',
    )
  }
  return context
}
