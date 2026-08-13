import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateRenterInvite } from '@/shared/api/renters'

export default function RenterInviteFormPage() {
  const navigate = useNavigate()
  const createInvitation = useCreateRenterInvite()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    try {
      const invitation = await createInvitation.mutateAsync({
        fullName: String(formData.get('fullName') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim() || undefined,
      })
      navigate(`/nguoi-thue/loi-moi/${invitation.id}`)
    } catch {
      setError('Không thể gửi lời mời. Vui lòng kiểm tra thông tin và thử lại.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/nguoi-thue">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Gửi lời mời người thuê</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống sẽ gửi email kèm liên kết để người thuê tạo tài khoản và xác minh thông tin.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Thông tin người nhận</CardTitle>
            <CardDescription>
              Vui lòng nhập chính xác địa chỉ email để người thuê có thể nhận được lời mời.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
              <Input id="fullName" name="fullName" placeholder="Nhập họ và tên người thuê" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" placeholder="Ví dụ: nguyenvana@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" type="tel" placeholder="Nhập số điện thoại (Không bắt buộc)" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <Button variant="outline" type="button" asChild>
              <Link to="/nguoi-thue">Hủy bỏ</Link>
            </Button>
            <Button type="submit" disabled={createInvitation.isPending}>
              {createInvitation.isPending ? 'Đang gửi...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gửi lời mời
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
