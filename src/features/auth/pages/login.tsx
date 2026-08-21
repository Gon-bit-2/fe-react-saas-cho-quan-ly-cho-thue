import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useLogin } from '@/shared/api/auth'
import { useAuth } from '@/shared/hooks/use-auth'
import { apiClient } from '@/shared/api/axios-client'
import type { UserProfile } from '@/shared/types/auth'
import { toAppError } from '@/shared/lib/errors'
import { getPostLoginPath } from '@/shared/lib/auth-navigation'

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Component() {
  const navigate = useNavigate()
  const { establishSession } = useAuth()
  const loginMutation = useLogin()

  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null)
    try {
      const loginRes = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })

      if (loginRes.message) {
        // Yêu cầu nhập OTP (2FA)
        navigate('/dang-nhap/otp', {
          state: {
            email: data.email,
            password: data.password,
            action: 'LOGIN',
          },
        })
        return
      }

      if (loginRes.accessToken) {
        // Lấy thông tin user
        const profileResponse = await apiClient.get<UserProfile>('/auth/profile', {
          headers: {
            Authorization: `Bearer ${loginRes.accessToken}`,
          },
        })

        const profile = profileResponse.data
        establishSession({ accessToken: loginRes.accessToken, refreshToken: loginRes.refreshToken! }, profile)
        navigate(getPostLoginPath(profile), { replace: true })
      }
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    }
  }

  // Fetch Google OAuth URL from backend
  const handleGoogleLogin = async () => {
    try {
      const response = await apiClient.get<{ url: string }>('/auth/google/url')
      if (response.data?.url) {
        window.location.href = response.data.url
      }
    } catch (err) {
      console.error('Google OAuth error:', err)
      setApiError('Không thể kết nối đến Google, vui lòng thử lại sau.')
    }
  }

  return (
    <div className="max-w-auth-card-width bg-surface-container-lowest p-page-padding-desktop relative w-full rounded-xl shadow-lg">
      <div className="mb-8 flex flex-col items-center">
        <img alt="Nhà Trọ Việt Logo" className="mb-4 h-16 w-auto object-contain" src="/logo.png" />
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Nhà Trọ Việt</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-center">
          Đăng nhập vào tài khoản của bạn để quản lý cho thuê phòng
        </p>
      </div>

      {apiError && (
        <div className="bg-error-container text-on-error-container mb-6 flex items-start gap-3 rounded-lg p-4">
          <span className="material-symbols-outlined text-error shrink-0">error</span>
          <span className="font-body-md text-body-md">{apiError}</span>
        </div>
      )}

      <form className="gap-gap-fields flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2">
              mail
            </span>
            <input
              {...register('email')}
              className="bg-surface text-on-surface font-body-md text-body-md focus:ring-primary-container h-10 w-full rounded-lg pr-4 pl-10 transition-all outline-none focus:ring-2"
              id="email"
              type="email"
              placeholder="admin@example.com"
            />
          </div>
          {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2">
              lock
            </span>
            <input
              {...register('password')}
              className="bg-surface text-on-surface font-body-md text-body-md focus:ring-primary-container h-10 w-full rounded-lg pr-10 pl-10 transition-all outline-none focus:border-transparent focus:ring-2"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
            />
            <button
              className="text-on-surface-variant hover:text-on-surface absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
          {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
        </div>

        <div className="flex items-center justify-between">
          <label className="group flex cursor-pointer items-center gap-2">
            <div className="bg-surface ring-outline-variant group-hover:ring-outline relative flex h-4 w-4 items-center justify-center rounded ring-1 transition-all ring-inset">
              <input {...register('remember')} className="peer sr-only" type="checkbox" />
              <span className="material-symbols-outlined text-primary-container absolute text-[14px] opacity-0 transition-opacity peer-checked:opacity-100">
                check
              </span>
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant select-none">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            className="font-label-md text-label-md text-primary-container hover:text-primary transition-colors"
            to="/quen-mat-khau"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          className="bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary group mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? (
            'Đang xử lý...'
          ) : (
            <>
              Đăng nhập
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="bg-surface-variant h-px flex-1"></div>
        <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Hoặc</span>
        <div className="bg-surface-variant h-px flex-1"></div>
      </div>

      <button
        className="bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface ring-outline-variant group flex h-10 w-full items-center justify-center gap-3 rounded-lg shadow-sm ring-1 transition-colors ring-inset"
        type="button"
        onClick={handleGoogleLogin}
      >
        <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          ></path>
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          ></path>
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          ></path>
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          ></path>
        </svg>
        Tiếp tục với Google
      </button>

      <div className="mt-8 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Chưa có tài khoản?
          <Link
            className="font-label-md text-label-md text-primary-container hover:text-primary ml-1 transition-colors"
            to="/dang-ky"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
