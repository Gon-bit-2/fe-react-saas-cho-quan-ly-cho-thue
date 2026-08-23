import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ChevronRight, Edit, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { adminRenterApi } from '../api/tenant.api'
import type { UserProfile } from '@/features/auth/api/types'

export const RenterDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [renter, setRenter] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRenterDetail = async () => {
      try {
        if (!id) return
        const response = await adminRenterApi.getRenterDetails(parseInt(id))
        setRenter(response?.data || null)
      } catch (error) {
        setRenter(null)
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchRenterDetail()
  }, [id])

  if (loading) {
    return <div className="text-muted-foreground p-8 text-center">Đang tải thông tin người thuê...</div>
  }

  if (!renter) {
    return <div className="text-muted-foreground p-8 text-center">Không tìm thấy thông tin người thuê.</div>
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span
          className="text-muted-foreground hover:text-primary cursor-pointer font-semibold tracking-wider uppercase transition-colors"
          onClick={() => navigate('/admin/nguoi-thue')}
        >
          Danh sách người thuê
        </span>
        <ChevronRight className="text-muted-foreground h-4 w-4" />
        <span className="text-foreground font-medium">Chi tiết người thuê</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Main Info Card */}
          <Card className="group border-t-primary relative overflow-hidden border-t-4">
            <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
            <CardContent className="p-6">
              <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm">
                    {renter.fullName.split(' ').pop()?.charAt(0) || 'U'}
                    <div
                      className="border-background absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-green-500"
                      title="Đã xác thực"
                    >
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">{renter.fullName}</h1>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <Button variant="outline" className="flex flex-1 items-center gap-2 md:flex-none">
                    <Edit className="h-4 w-4" />
                    Cập nhật
                  </Button>
                  <Button className="flex flex-1 items-center gap-2 md:flex-none">
                    <Lock className="h-4 w-4" />
                    Khóa tạm thời
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 border-border grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Email</span>
                  <span className="text-foreground truncate text-sm font-medium" title={renter.email}>
                    {renter.email}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Số điện thoại
                  </span>
                  <span className="text-foreground text-sm font-medium">{renter.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Ngày tham gia
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {new Date(renter.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {/* Admin Actions */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <h2 className="text-destructive mb-4 flex items-center gap-2 text-lg font-bold">
                  <ShieldAlert className="h-5 w-5" />
                  Thao tác quản trị
                </h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  Thao tác khóa hoặc cập nhật trạng thái sẽ ảnh hưởng trực tiếp đến người thuê này trên toàn hệ thống.
                  Vui lòng nhập lý do cụ thể.
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Lý do xử lý
                    </Label>
                    <textarea
                      className="bg-background border-input focus-visible:ring-destructive resize-none"
                      placeholder="Nhập lý do..."
                      rows={3}
                    />
                  </div>
                  <Button variant="destructive" className="flex w-full items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Đình chỉ hoạt động
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
