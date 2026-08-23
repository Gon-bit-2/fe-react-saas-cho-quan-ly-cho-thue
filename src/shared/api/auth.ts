import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import type { UserProfile } from '@/shared/types/auth'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/shared/types/errors'

// ─── Interfaces ──────────────────────────────────────────────────

export interface SendOTPBody {
  email: string
  type: 'REGISTER' | 'FORGOT_PASSWORD' | 'LOGIN'
}

export interface LoginBody {
  email: string
  password: string
  code?: string
}

export interface RegisterBody {
  email: string
  password: string
  fullName: string
  phone: string
  confirmPassword: string
  code: string
  roleCode: 'LANDLORD' | 'TENANT'
}

export interface ForgotPasswordBody {
  email: string
  code: string
  newPassword: string
  confirmNewPassword: string
}

export interface LoginRes {
  accessToken?: string
  refreshToken?: string
  message?: string
}

// ─── API Calls ───────────────────────────────────────────────────

export const authApi = {
  sendOTP: async (data: SendOTPBody) => {
    const response = await apiClient.post('/auth/send-otp', data)
    return response.data
  },

  login: async (data: LoginBody) => {
    const response = await apiClient.post<LoginRes>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterBody) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  forgotPassword: async (data: ForgotPasswordBody) => {
    const response = await apiClient.post('/auth/forgot-password', data)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get<UserProfile>('/auth/profile')
    return response.data
  },
}

// ─── React Query Hooks ───────────────────────────────────────────

/**
 * Hook gửi OTP
 */
export const useSendOTP = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, SendOTPBody>({
    mutationFn: authApi.sendOTP,
  })
}

/**
 * Hook đăng nhập
 */
export const useLogin = () => {
  return useMutation<LoginRes, AxiosError<ApiErrorResponse>, LoginBody>({
    mutationFn: authApi.login,
  })
}

/**
 * Hook đăng ký
 */
export const useRegister = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, RegisterBody>({
    mutationFn: authApi.register,
  })
}

/**
 * Hook lấy lại mật khẩu
 */
export const useForgotPassword = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, ForgotPasswordBody>({
    mutationFn: authApi.forgotPassword,
  })
}

/**
 * Hook lấy thông tin Profile
 */
export const useProfile = () => {
  return useQuery<UserProfile, AxiosError<ApiErrorResponse>>({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.getProfile,
    // Không tự động fetch profile khi component mount nếu không cần thiết
    // (Vì auth-provider đã lo việc fetch profile lúc bootstrap)
    enabled: false,
  })
}
