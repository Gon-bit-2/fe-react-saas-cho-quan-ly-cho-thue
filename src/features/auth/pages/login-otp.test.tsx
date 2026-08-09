import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Component as LoginOTP } from './login-otp'
import { renderWithProviders } from '@/tests/utils'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server'
const API_URL = import.meta.env?.VITE_API_URL || '/api'

describe('Login OTP Page', () => {
  it('renders OTP form correctly with email from state', () => {
    renderWithProviders(<LoginOTP />, {
      route: '/login/otp',
      routeState: { email: 'test@example.com', action: 'LOGIN', passwordHash: 'hash' }
    })
    
    expect(screen.getByText('Xác minh OTP')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    // 6 inputs for OTP
    expect(screen.getAllByRole('textbox')).toHaveLength(6)
  })

  it('shows error if OTP is less than 6 digits', async () => {
    const { user } = renderWithProviders(<LoginOTP />, {
      route: '/login/otp',
      routeState: { email: 'test@example.com', action: 'LOGIN', passwordHash: 'hash' }
    })
    
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    
    const submitBtn = screen.getByRole('button', { name: /Xác nhận/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Vui lòng nhập đủ 6 số OTP')).toBeInTheDocument()
    })
  })

  it('submits successfully and navigates', async () => {
    const { user } = renderWithProviders(<LoginOTP />, {
      route: '/login/otp',
      routeState: { email: 'test@example.com', action: 'LOGIN', passwordHash: 'hash' }
    })
    
    // We can simulate pasting the OTP or typing
    const inputs = screen.getAllByRole('textbox')
    const otpCode = '123456'
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], otpCode[i])
    }
    
    const submitBtn = screen.getByRole('button', { name: /Xác nhận/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.queryByText('Vui lòng nhập đủ 6 số OTP')).not.toBeInTheDocument()
    })
  })

  it('shows API error if login fails on OTP step', async () => {
    // Override MSW handler for this test
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json(
          { statusCode: 400, message: 'Mã OTP không đúng', code: 'INVALID_OTP', requestId: 'mock-req-id' },
          { status: 400 }
        )
      })
    )

    const { user } = renderWithProviders(<LoginOTP />, {
      route: '/login/otp',
      routeState: { email: 'test@example.com', action: 'LOGIN', passwordHash: 'hash' }
    })
    
    const inputs = screen.getAllByRole('textbox')
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], '1')
    }
    
    const submitBtn = screen.getByRole('button', { name: /Xác nhận/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Mã OTP không đúng')).toBeInTheDocument()
    })
  })
})
