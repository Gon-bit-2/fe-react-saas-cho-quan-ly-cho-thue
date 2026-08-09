import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Component as SelectTenant } from './select-tenant'
import { renderWithProviders } from '@/tests/utils'
import { useAuth } from '@/shared/hooks/use-auth'

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('Select Tenant Page', () => {
  it('renders correctly with no tenants', () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { tenantMembers: [] },
      selectTenant: vi.fn(),
      logout: vi.fn(),
    } as any)
    
    renderWithProviders(<SelectTenant />)
    
    expect(screen.getByText('Chọn Tổ chức / Nhà trọ')).toBeInTheDocument()
    expect(screen.getByText('Tài khoản của bạn hiện chưa được phân quyền vào bất kỳ tổ chức nào.')).toBeInTheDocument()
  })

  it('renders list of tenants and allows selection', async () => {
    const mockSelectTenant = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      profile: {
        tenantMembers: [
          {
            id: 1,
            tenantId: 100,
            status: 'ACTIVE',
            role: { name: 'ADMIN' },
            tenant: { name: 'Test Tenant 1', status: 'ACTIVE' }
          },
          {
            id: 2,
            tenantId: 101,
            status: 'ACTIVE',
            role: { name: 'USER' },
            tenant: { name: 'Test Tenant 2', status: 'ACTIVE' }
          }
        ]
      },
      selectTenant: mockSelectTenant,
      logout: vi.fn(),
    } as any)
    
    const { user } = renderWithProviders(<SelectTenant />)
    
    expect(screen.getByText('Test Tenant 1')).toBeInTheDocument()
    expect(screen.getByText('Test Tenant 2')).toBeInTheDocument()
    
    const tenant1Btn = screen.getByRole('button', { name: /Test Tenant 1/i })
    await user.click(tenant1Btn)
    
    expect(mockSelectTenant).toHaveBeenCalledWith(100)
  })

  it('allows logging out', async () => {
    const mockLogout = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      profile: { tenantMembers: [] },
      selectTenant: vi.fn(),
      logout: mockLogout,
    } as any)
    
    const { user } = renderWithProviders(<SelectTenant />)
    
    const logoutBtn = screen.getByRole('button', { name: /Quay lại trang đăng nhập/i })
    await user.click(logoutBtn)
    
    expect(mockLogout).toHaveBeenCalled()
  })
})
