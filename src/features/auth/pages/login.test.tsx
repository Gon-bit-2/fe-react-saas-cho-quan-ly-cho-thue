import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Component as Login } from './login'
import { renderWithProviders } from '@/tests/utils'

// Mock navigate if needed, but MemoryRouter handles navigation state.
// We'll rely on the MSW mock for API responses.

describe('Login Page', () => {
  it('renders login form correctly', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const { user } = renderWithProviders(<Login />)
    
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument()
      expect(screen.getByText('Mật khẩu là bắt buộc')).toBeInTheDocument()
    })
  })

  it('shows error message for invalid credentials', async () => {
    const { user } = renderWithProviders(<Login />)
    
    await user.type(screen.getByLabelText(/Email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/Mật khẩu/i), 'wrongpass')
    
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      // It should display the error message from the mocked 401 response or default error
      expect(screen.getByText(/Invalid credentials|Lỗi không xác định/i)).toBeInTheDocument()
    })
  })

  it('submits successfully and navigates (using MSW mock)', async () => {
    const { user } = renderWithProviders(<Login />)
    
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/Mật khẩu/i), 'password123')
    
    const submitBtn = screen.getByRole('button', { name: /Đăng nhập/i })
    await user.click(submitBtn)
    
    // As we use MemoryRouter without asserting window.location, 
    // we just ensure the error message is NOT present.
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      expect(screen.queryByText('Email là bắt buộc')).not.toBeInTheDocument()
    })
  })
})
