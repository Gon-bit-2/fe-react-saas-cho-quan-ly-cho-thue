import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { RequireAuth } from './require-auth'
import { renderWithProviders } from '@/tests/utils'
import { useAuth } from '@/shared/hooks/use-auth'
import { Route, Routes } from 'react-router'

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('RequireAuth Guard', () => {
  it('shows loading when bootstrapping', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'bootstrapping' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(<RequireAuth />)
    expect(screen.getByText('Đang xác thực...')).toBeInTheDocument()
  })

  it('renders outlet when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'authenticated' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when anonymous', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'anonymous' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(
      <Routes>
        <Route path="/protected" element={<RequireAuth />}>
          <Route path="" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { route: '/protected' }
    )
    
    // It should redirect and not show Protected Content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
