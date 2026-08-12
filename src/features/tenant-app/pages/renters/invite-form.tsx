import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RenterInviteFormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Giả lập gọi API tạo lời mời
    setTimeout(() => {
      setLoading(false)
      // Chuyển hướng đến chi tiết lời mời sau khi tạo xong (giả sử id = 999)
      navigate('/nguoi-thue/loi-moi/999')
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/app/nguoi-thue">
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
              <Input id="fullName" placeholder="Nhập họ và tên người thuê" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" placeholder="Ví dụ: nguyenvana@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" type="tel" placeholder="Nhập số điện thoại (Không bắt buộc)" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
            <Button variant="outline" type="button" asChild>
              <Link to="/app/nguoi-thue">Hủy bỏ</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : (
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
