import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForgotPassword } from '@/shared/api/auth'
import { toAppError } from '@/shared/lib/errors'

const resetSchema = z
  .object({
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export function Component() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Lấy email, code từ state
  const email = (location.state as { email?: string })?.email
  const code = (location.state as { code?: string })?.code

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const passwordValue = useWatch({ control, name: 'password' }) || ''
  const confirmValue = useWatch({ control, name: 'confirmPassword' }) || ''

  const reqLength = passwordValue.length >= 8
  const reqUpper = /[A-Z]/.test(passwordValue)
  const reqNumber = /[0-9]/.test(passwordValue)
  const reqSpecial = /[@$!%*?&]/.test(passwordValue)
  const reqMatch = passwordValue === confirmValue && passwordValue !== ''

  const score = [reqLength, reqUpper, reqNumber, reqSpecial].filter(Boolean).length
  let strengthWidth = '0%'
  let strengthColor = 'bg-error'
  if (score > 0 && score <= 2) {
    strengthWidth = '25%'
    strengthColor = 'bg-error'
  } else if (score === 3) {
    strengthWidth = '50%'
    strengthColor = 'bg-status-warning'
  } else if (score === 4) {
    strengthWidth = '100%'
    strengthColor = 'bg-tertiary'
  }

  const isFormValid = score === 4 && reqMatch

  // Nếu truy cập không qua luồng forgot-password
  useEffect(() => {
    if (!email || !code) {
      navigate('/login')
    }
  }, [email, code, navigate])

  const onSubmit = async (data: ResetFormValues) => {
    setApiError(null)
    try {
      if (!email || !code) throw new Error('Yêu cầu không hợp lệ')
      
      await resetMutation.mutateAsync({
        email,
        code,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    }
  }

  return (
    <div className="flex flex-col w-full h-full items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5"></path>
            </pattern>
          </defs>
          <rect className="text-primary" fill="url(#grid)" height="100%" width="100%"></rect>
        </svg>
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-tertiary/10 rounded-full blur-[60px]"></div>
      </div>

      <div className="w-full max-w-[440px] bg-surface-container-lowest rounded-xl shadow-xl p-[32px] relative z-10 mx-auto">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4 text-on-primary-fixed shadow-md">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_reset
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
            Đặt lại mật khẩu
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3 shadow-sm">
            <span className="material-symbols-outlined shrink-0 text-error">
              error
            </span>
            <span className="font-body-md text-body-md">{apiError}</span>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-[4px] relative">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="newPassword">
              Mật khẩu mới
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                lock
              </span>
              <input
                {...register('password')}
                className="w-full h-[48px] md:h-[40px] bg-surface-container-lowest rounded px-10 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all border border-surface-border"
                id="newPassword"
                placeholder="Nhập mật khẩu mới"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {errors.password && <span className="text-error text-xs">{errors.password.message}</span>}
          </div>

          <div className="flex flex-col gap-[4px] relative">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                swipe_left_alt
              </span>
              <input
                {...register('confirmPassword')}
                className="w-full h-[48px] md:h-[40px] bg-surface-container-lowest rounded px-10 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all border border-surface-border"
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                type={showConfirm ? 'text' : 'password'}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                <span className="material-symbols-outlined">
                  {showConfirm ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {errors.confirmPassword && <span className="text-error text-xs">{errors.confirmPassword.message}</span>}
          </div>

          <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-3">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
              Yêu cầu mật khẩu
            </p>
            <ul className="flex flex-col gap-2">
              <RequirementItem met={reqLength} text="Ít nhất 8 ký tự" />
              <RequirementItem met={reqUpper} text="Ít nhất 1 chữ hoa" />
              <RequirementItem met={reqNumber} text="Ít nhất 1 số" />
              <RequirementItem met={reqSpecial} text="Ít nhất 1 ký tự đặc biệt (@$!%*?&)" />
              <RequirementItem met={reqMatch} text="Mật khẩu trùng khớp" />
            </ul>
            <div className="mt-2 h-1 w-full bg-surface-variant rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColor}`}
                style={{ width: strengthWidth }}
              ></div>
            </div>
          </div>

          <button
            className="w-full h-[48px] md:h-[40px] bg-primary text-on-primary rounded font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isSubmitting || resetMutation.isPending || success}
            type="submit"
          >
            {success ? (
              <>
                <span>Đã đặt lại</span>
                <span className="material-symbols-outlined">check</span>
              </>
            ) : isSubmitting || resetMutation.isPending ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>Đặt lại mật khẩu</span>
                <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <div className="text-center mt-2">
            <Link
              className="font-body-md text-body-md text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1"
              to="/login"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-full shadow-xl flex items-center gap-3 transform transition-all duration-500 z-50 ${
          success ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <span className="font-body-md text-body-md">Mật khẩu đã được thay đổi thành công!</span>
      </div>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <li
      className={`flex items-center gap-2 font-body-md text-body-md transition-colors ${
        met ? 'text-tertiary' : 'text-on-surface-variant'
      }`}
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: met ? "'FILL' 1" : "'FILL' 0" }}
      >
        {met ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      <span>{text}</span>
    </li>
  )
}
