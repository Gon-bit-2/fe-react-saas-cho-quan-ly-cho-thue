import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ChevronRight, Edit, Lock, Home, User, MapPin, ShieldAlert, History, Key, CheckCircle2 } from 'lucide-react'
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
                    <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      123 Nguyễn Văn Linh, Quận 7, TP.HCM (Thường trú)
                    </p>
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
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    CMND/CCCD
                  </span>
                  <span className="text-foreground text-sm font-medium">079012345678</span>
                </div>
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
                  <span className="text-foreground text-sm font-medium">0901 234 567</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Ngày tham gia
                  </span>
                  <span className="text-foreground text-sm font-medium">15/05/2023</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-6 flex items-center gap-2 text-lg font-bold">
                <History className="text-primary h-5 w-5" />
                Tổng quan hoạt động
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="bg-muted/30 border-border group flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-transform hover:-translate-y-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Số phòng đã/đang thuê
                    </span>
                    <span className="text-foreground text-3xl font-bold">3</span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Home className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-muted/30 border-border group flex cursor-pointer items-center justify-between rounded-xl border p-5 transition-transform hover:-translate-y-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Hợp đồng đang có hiệu lực
                    </span>
                    <span className="text-foreground text-3xl font-bold">1</span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Key className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="border-border mt-6 border-t pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Phòng đang thuê hiện tại
                  </h3>
                  <a className="text-primary cursor-pointer text-sm font-medium hover:underline">Xem tất cả lịch sử</a>
                </div>
                <div className="space-y-3">
                  <div className="bg-card border-border hover:border-primary/50 flex cursor-pointer items-center justify-between rounded-lg border p-3 shadow-sm transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                        <Home className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm font-semibold">
                          Phòng 302 - Tòa nhà Sunrise Cầu Giấy
                        </span>
                        <span className="text-muted-foreground text-xs">Chủ trọ: Trần Thị Bích (ID: LL-9021)</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đang thuê</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Linked Accounts */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-bold">
                <User className="text-primary h-5 w-5" />
                Chủ trọ liên kết
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Người thuê này đang có liên kết (thuê phòng) với các chủ trọ sau:
              </p>
              <div className="space-y-3">
                <div className="bg-muted/30 border-border hover:bg-muted group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      TB
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-semibold">Trần Thị Bích</span>
                      <span className="text-muted-foreground text-xs">ID: LL-9021</span>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6">
              <h2 className="text-destructive mb-4 flex items-center gap-2 text-lg font-bold">
                <ShieldAlert className="h-5 w-5" />
                Thao tác quản trị
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Thao tác khóa hoặc cập nhật trạng thái sẽ ảnh hưởng trực tiếp đến người thuê này trên toàn hệ thống. Vui
                lòng nhập lý do cụ thể.
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
  )
}

