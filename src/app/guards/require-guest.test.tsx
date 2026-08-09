import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { RequireGuest } from './require-guest'
import { renderWithProviders } from '@/tests/utils'
import { useAuth } from '@/shared/hooks/use-auth'
import { Route, Routes } from 'react-router'

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('RequireGuest Guard', () => {
  it('shows loading when bootstrapping', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'bootstrapping' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(<RequireGuest />)
    expect(screen.getByText('Đang kiểm tra phiên đăng nhập...')).toBeInTheDocument()
  })

  it('renders outlet when anonymous', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'anonymous' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/" element={<div>Guest Content</div>} />
        </Route>
      </Routes>
    )
    expect(screen.getByText('Guest Content')).toBeInTheDocument()
  })

  it('redirects to /account when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ state: 'authenticated' } as unknown as ReturnType<typeof useAuth>)
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<RequireGuest />}>
          <Route path="" element={<div>Login Page</div>} />
        </Route>
        <Route path="/account" element={<div>Account Page</div>} />
      </Routes>,
      { route: '/login' }
    )
    
    // It should redirect and not show Login Page
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
    expect(screen.getByText('Account Page')).toBeInTheDocument()
  })
})
