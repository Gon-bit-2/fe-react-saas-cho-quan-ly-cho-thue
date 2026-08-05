import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { queryClient } from '@/app/config/query-client'
import { AuthProvider } from '@/app/providers/auth-provider'
import { FatalErrorBoundary } from '@/app/providers/error-boundary'
import { router } from '@/app/router/routes'

/**
 * App composition root.
 *
 * Thứ tự provider (ngoài → trong):
 * 1. FatalErrorBoundary — bắt mọi lỗi render không xử lý
 * 2. QueryClientProvider — cung cấp TanStack Query cache
 * 3. AuthProvider — bootstrap session trước khi route render
 * 4. RouterProvider — render route tree
 * 5. Toaster — toast notifications (Sonner)
 *
 * Không chứa nghiệp vụ feature — chỉ wiring infrastructure.
 */
function App() {
  return (
    <FatalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </FatalErrorBoundary>
  )
}

export default App
