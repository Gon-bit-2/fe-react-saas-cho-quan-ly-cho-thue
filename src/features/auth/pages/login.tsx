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
      const tokenPair = await loginMutation.mutateAsync({
        email: data.email,
        passwordHash: data.password, // Frontend gửi password thô (hoặc hash nếu cần thiết theo design API)
      })

      // Lấy thông tin user
      const profileResponse = await apiClient.get<UserProfile>('/auth/profile', {
        headers: {
          Authorization: `Bearer ${tokenPair.accessToken}`,
        },
      })

      establishSession(tokenPair, profileResponse.data)
      navigate('/account')
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    }
  }

  // Google OAuth URL (example)
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`
  }

  return (
    <div className="relative w-full max-w-auth-card-width bg-surface-container-lowest rounded-xl shadow-lg p-page-padding-desktop">
      <div className="flex flex-col items-center mb-8">
        <img
          alt="Rental SaaS Logo"
          className="w-16 h-16 object-contain mb-4"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyLm5J0odnQpMPSA8arxrkeH3VjvXLfd6a6sFsQFPf5cxc40RwPweR2G6Ub1bIOGjsU0YMPJWbwncbedAmWgKXqONnlOAq9jbn0kRxfHzHscNn_acn8bJQMy9W6aR2vp2A-_-kpdG1hgFpg_UE4SM5qOqK2r4UCz0FiSRhbMUvn1q4QIZnkpdhXkm3uAOuvv-fbxOScm7uM6w05QYypwqu848BS4DgfmJ-KT4gDntWJwfCBFW_4prB"
        />
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Rental SaaS
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 text-center">
          Đăng nhập vào tài khoản của bạn để quản lý bất động sản
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined shrink-0 text-error">
            error
          </span>
          <span className="font-body-md text-body-md">{apiError}</span>
        </div>
      )}

      <form className="flex flex-col gap-gap-fields" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1">
          <label
            className="font-label-md text-label-md text-on-surface"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              mail
            </span>
            <input
              {...register('email')}
              className="w-full h-10 bg-surface pl-10 pr-4 rounded-lg text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container transition-all"
              id="email"
              type="email"
              placeholder="admin@example.com"
            />
          </div>
          {errors.email && (
            <span className="text-error text-xs">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="font-label-md text-label-md text-on-surface"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              lock
            </span>
            <input
              {...register('password')}
              className="w-full h-10 bg-surface pl-10 pr-10 rounded-lg text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
          {errors.password && (
            <span className="text-error text-xs">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 rounded bg-surface ring-1 ring-inset ring-outline-variant group-hover:ring-outline transition-all">
              <input {...register('remember')} className="peer sr-only" type="checkbox" />
              <span className="material-symbols-outlined text-[14px] text-primary-container opacity-0 peer-checked:opacity-100 transition-opacity absolute">
                check
              </span>
            </div>
            <span className="font-body-md text-body-md text-on-surface-variant select-none">
              Ghi nhớ đăng nhập
            </span>
          </label>
          <Link
            className="font-label-md text-label-md text-primary-container hover:text-primary transition-colors"
            to="/forgot-password"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          className="w-full h-10 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary transition-colors mt-2 shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50"
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending ? (
            'Đang xử lý...'
          ) : (
            <>
              Đăng nhập
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-surface-variant flex-1"></div>
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          Hoặc
        </span>
        <div className="h-px bg-surface-variant flex-1"></div>
      </div>

      <button
        className="w-full h-10 bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface transition-colors flex items-center justify-center gap-3 ring-1 ring-inset ring-outline-variant shadow-sm group"
        type="button"
        onClick={handleGoogleLogin}
      >
        <svg
          className="w-5 h-5 group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
        >
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
            className="font-label-md text-label-md text-primary-container hover:text-primary transition-colors ml-1"
            to="/register"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
