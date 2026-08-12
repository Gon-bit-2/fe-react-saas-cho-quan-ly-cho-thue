import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useSendOTP } from '@/shared/api/auth'
import { toAppError } from '@/shared/lib/errors'

const registerSchema = z
  .object({
    fullname: z.string().min(1, 'Họ và tên là bắt buộc'),
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
    confirm_password: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với Điều khoản',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function Component() {
  const navigate = useNavigate()
  const sendOtpMutation = useSendOTP()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null)
    try {
      // 1. Lưu tạm thông tin đăng ký (ví dụ: sessionStorage)
      // Trong thực tế có thể gọi 1 API pre-register hoặc chỉ gửi OTP
      await sendOtpMutation.mutateAsync({
        email: data.email,
        type: 'REGISTER',
      })
      
      // Chuyển sang màn hình nhập OTP
      navigate('/dang-nhap/otp', { 
        state: { 
          email: data.email, 
          action: 'REGISTER',
          registerData: data
        } 
      })
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    }
  }

  return (
    <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-xl shadow-lg p-page-padding-desktop flex flex-col gap-gap-sections relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mt-16 -mr-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-tertiary/5 rounded-full blur-2xl -mb-16 -ml-16 pointer-events-none" />

      <div className="flex flex-col items-center gap-gap-fields text-center relative z-10">
        <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-base">
          <span className="material-symbols-outlined text-primary text-[32px]">
            person_add
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          Tạo tài khoản mới
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Bắt đầu quản lý bất động sản của bạn một cách thông minh.
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3 shadow-sm relative z-10">
          <span className="material-symbols-outlined shrink-0 text-error">
            error
          </span>
          <span className="font-body-md text-body-md">{apiError}</span>
        </div>
      )}

      <form className="flex flex-col gap-gap-fields relative z-10" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-base">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="fullname">
            Họ và tên
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
              person
            </span>
            <input
              {...register('fullname')}
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              id="fullname"
              placeholder="Nguyễn Văn A"
              type="text"
            />
          </div>
          {errors.fullname && <span className="text-error text-xs">{errors.fullname.message}</span>}
        </div>

        <div className="flex flex-col gap-base">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
              mail
            </span>
            <input
              {...register('email')}
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              id="email"
              placeholder="nguyenvana@example.com"
              type="email"
            />
          </div>
          {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-base">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">
            Số điện thoại
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
              phone
            </span>
            <input
              {...register('phone')}
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              id="phone"
              placeholder="0901234567"
              type="tel"
            />
          </div>
          {errors.phone && <span className="text-error text-xs">{errors.phone.message}</span>}
        </div>

        <div className="flex flex-col gap-base">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
              lock
            </span>
            <input
              {...register('password')}
              className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
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

        <div className="flex flex-col gap-base">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="confirm_password">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
              lock_reset
            </span>
            <input
              {...register('confirm_password')}
              className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              id="confirm_password"
              placeholder="••••••••"
              type={showConfirm ? 'text' : 'password'}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showConfirm ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
          {errors.confirm_password && (
            <span className="text-error text-xs">{errors.confirm_password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5">
              <input
                {...register('terms')}
                className="w-4 h-4 rounded text-primary focus:ring-primary/50 bg-surface-container-low cursor-pointer"
                id="terms"
                type="checkbox"
              />
            </div>
            <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="terms">
              Tôi đồng ý với các{' '}
              <Link className="text-primary hover:underline font-label-md text-label-md" to="/terms">
                Điều khoản
              </Link>{' '}
              và{' '}
              <Link className="text-primary hover:underline font-label-md text-label-md" to="/privacy">
                Chính sách bảo mật
              </Link>{' '}
              của hệ thống.
            </label>
          </div>
          {errors.terms && <span className="text-error text-xs ml-7">{errors.terms.message}</span>}
        </div>

        <button
          className="w-full h-10 mt-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/20 group disabled:opacity-50"
          type="submit"
          disabled={isSubmitting || sendOtpMutation.isPending}
        >
          {isSubmitting || sendOtpMutation.isPending ? (
            <span>Đang xử lý...</span>
          ) : (
            <>
              <span>Tạo tài khoản</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </form>

      <div className="text-center relative z-10 pt-4">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Đã có tài khoản?
          <Link className="text-primary font-label-md text-label-md hover:underline ml-1" to="/dang-nhap">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
