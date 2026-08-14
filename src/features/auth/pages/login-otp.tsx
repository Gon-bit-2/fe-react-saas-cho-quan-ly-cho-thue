import { useState, useRef } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { apiClient } from '@/shared/api/axios-client'
import { authApi } from '@/shared/api/auth'
import { useAuth } from '@/shared/hooks/use-auth'
import { toAppError } from '@/shared/lib/errors'
import type { UserProfile } from '@/shared/types/auth'
import { getPostLoginPath } from '@/shared/lib/auth-navigation'

export function Component() {
  const navigate = useNavigate()
  const location = useLocation()
  const { establishSession } = useAuth()
  
  // Lấy dữ liệu từ state truyền vào khi redirect
  const state = location.state as { 
    email?: string; 
    action?: string;
    password?: string;
    registerData?: { email: string; password: string; fullname: string; phone: string; confirm_password: string };
  }
  
  const email = state?.email || ''
  const actionType = state?.action || 'LOGIN'

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      // Focus vào ô tiếp theo
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }

  const onSubmit = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setApiError('Vui lòng nhập đủ 6 số OTP')
      return
    }

    setApiError(null)
    setIsSubmitting(true)
    
    try {
      if (actionType === 'FORGOT_PASSWORD') {
        // Chuyển sang đặt lại mật khẩu kèm code
        navigate('/dat-lai-mat-khau', { state: { email, code } })
        return
      }

      if (actionType === 'LOGIN') {
        if (!state?.password) throw new Error('Thiếu thông tin đăng nhập')
        
        const loginRes = await authApi.login({ 
          email, 
          password: state.password, 
          code 
        })
        
        if (loginRes.accessToken) {
          const profileResponse = await apiClient.get<UserProfile>('/auth/profile', {
            headers: { Authorization: `Bearer ${loginRes.accessToken}` },
          })
          establishSession(
            { accessToken: loginRes.accessToken, refreshToken: loginRes.refreshToken! }, 
            profileResponse.data
          )
          navigate(getPostLoginPath(profileResponse.data), { replace: true })
        }
      } else if (actionType === 'REGISTER') {
        if (!state?.registerData) throw new Error('Thiếu thông tin đăng ký')
        
        await authApi.register({
          email: state.registerData.email,
          password: state.registerData.password,
          fullName: state.registerData.fullname,
          phone: state.registerData.phone,
          confirmPassword: state.registerData.confirm_password,
          code,
          roleCode: 'TENANT', // Tạm thời hardcode, có thể tuỳ chọn trên UI
        })
        
        // Tự động đăng nhập sau khi đăng ký thành công
        const loginRes = await authApi.login({ 
          email: state.registerData.email, 
          password: state.registerData.password 
        })
        
        if (loginRes.accessToken) {
          const profileResponse = await apiClient.get<UserProfile>('/auth/profile', {
            headers: { Authorization: `Bearer ${loginRes.accessToken}` },
          })
          establishSession(
            { accessToken: loginRes.accessToken, refreshToken: loginRes.refreshToken! }, 
            profileResponse.data
          )
          navigate(getPostLoginPath(profileResponse.data), { replace: true })
        }
      }
    } catch (err) {
      const appErr = toAppError(err)
      setApiError(appErr.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-auth-card-width bg-surface-container-lowest rounded-xl shadow-lg p-page-padding-desktop">
      <div className="text-center mb-8">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Xác minh OTP
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Mã xác thực đã được gửi đến email{' '}
          <span className="font-label-md text-label-md text-on-surface">{email}</span>
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-error opacity-10"></div>
          <span className="material-symbols-outlined text-error relative z-10 shrink-0">
            error
          </span>
          <span className="font-body-md text-body-md relative z-10">
            {apiError}
          </span>
        </div>
      )}

      <div className="flex justify-between gap-2 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            className="w-12 h-14 text-center font-headline-md text-headline-md bg-surface border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-on-surface transition-shadow shadow-sm"
            maxLength={1}
            type="text"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <button
        className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mb-6 disabled:opacity-50"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span>Đang xử lý...</span>
        ) : (
          <>
            <span>Xác nhận</span>
            <span className="material-symbols-outlined text-on-primary">
              arrow_forward
            </span>
          </>
        )}
      </button>

      <div className="mt-4 text-center flex flex-col gap-2 items-center justify-center">
        <Link 
          to="/dang-nhap"
          className="text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors underline decoration-transparent hover:decoration-primary underline-offset-4"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  )
}
