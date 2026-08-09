import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSendOTP } from '@/shared/api/auth'
import { toAppError } from '@/shared/lib/errors'

export function Component() {
  const navigate = useNavigate()
  const sendOtpMutation = useSendOTP()
  const [email, setEmail] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setApiError(null)
    try {
      await sendOtpMutation.mutateAsync({
        email,
        type: 'FORGOT_PASSWORD',
      })
      setSuccess(true)
      
      // Sau 2s chuyển sang trang OTP
      setTimeout(() => {
        navigate('/dang-nhap/otp', { state: { email, action: 'FORGOT_PASSWORD' } })
      }, 2000)
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    }
  }

  return (
    <div className="flex flex-col w-full h-full justify-center items-center relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.1"></stop>
              <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0.8"></stop>
            </linearGradient>
          </defs>
          <rect fill="url(#grad1)" height="100%" width="100%"></rect>
          <circle className="animate-pulse" cx="20%" cy="30%" fill="var(--color-secondary-container)" fillOpacity="0.2" r="25%" style={{ animationDuration: '4s' }}></circle>
          <circle className="animate-pulse" cx="80%" cy="70%" fill="var(--color-tertiary-container)" fillOpacity="0.15" r="30%" style={{ animationDuration: '6s' }}></circle>
        </svg>
      </div>

      <div className="bg-surface-container-lowest w-full max-w-[440px] p-8 md:p-10 rounded-xl shadow-lg relative z-10 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-2">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_reset
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Quên mật khẩu?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        {apiError && (
          <div className="p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3 shadow-sm">
            <span className="material-symbols-outlined shrink-0 text-error">
              error
            </span>
            <span className="font-body-md text-body-md">{apiError}</span>
          </div>
        )}

        {!success ? (
          <form className="flex flex-col gap-gap-fields" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  mail
                </span>
                <input
                  className="w-full h-10 pl-10 pr-4 bg-surface rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  id="email"
                  placeholder="nguyenvan.a@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-on-primary-fixed-variant transition-colors duration-200 flex items-center justify-center gap-2 mt-2 shadow-md disabled:opacity-50"
              type="submit"
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? (
                <span>Đang gửi mã...</span>
              ) : (
                <>
                  <span>Gửi mã xác nhận</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra hộp thư đến. Đang chuyển hướng...
            </p>
          </div>
        )}

        <div className="flex justify-center mt-2">
          <Link
            className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors duration-200 flex items-center gap-1 group"
            to="/dang-nhap"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>Quay lại Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
