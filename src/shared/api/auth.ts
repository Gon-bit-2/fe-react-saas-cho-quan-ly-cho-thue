import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import type { TokenPair, UserProfile } from '@/shared/types/auth'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/shared/types/errors'

// ─── Interfaces ──────────────────────────────────────────────────

export interface SendOTPBody {
  email: string
  type: 'REGISTER' | 'FORGOT_PASSWORD' | 'LOGIN'
}

export interface LoginBody {
  email: string
  passwordHash: string
  code?: string
}

// ─── API Calls ───────────────────────────────────────────────────

export const authApi = {
  sendOTP: async (data: SendOTPBody) => {
    const response = await apiClient.post('/auth/send-otp', data)
    return response.data
  },

  login: async (data: LoginBody) => {
    const response = await apiClient.post<TokenPair>('/auth/login', data)
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
  return useMutation<TokenPair, AxiosError<ApiErrorResponse>, LoginBody>({
    mutationFn: authApi.login,
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
