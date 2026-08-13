import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronRight,
  History,
  Star,
  Mail,
  Phone,
  MapPin,
  Download,
  Lock,
  LockOpen,
  Ban,
  Eye,
  Home,
  Crown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { adminTenantApi, type Tenant } from '../api/tenant.api'

export const LandlordDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTenantDetail = async () => {
      try {
        if (!id) return
        const response = await adminTenantApi.getTenantDetails(parseInt(id))
        setTenant(response?.data || null)
      } catch (error) {
        setTenant(null)
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchTenantDetail()
  }, [id])

  if (loading) {
    return <div className="text-muted-foreground p-8 text-center">Đang tải thông tin chủ trọ...</div>
  }

  if (!tenant) {
    return <div className="text-muted-foreground p-8 text-center">Không tìm thấy thông tin chủ trọ.</div>
  }

  const isBanned = tenant.status === 'BANNED'
  const isSuspended = tenant.status === 'INACTIVE'
  const isActive = tenant.status === 'ACTIVE'

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-muted/30 border-border flex flex-col items-start justify-between gap-4 rounded-xl border p-6 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm">
            <span
              className="text-muted-foreground hover:text-primary cursor-pointer font-semibold tracking-wider uppercase transition-colors"
              onClick={() => navigate('/admin/chu-tro')}
            >
              Quản lý chủ trọ
            </span>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground font-medium">Chi tiết tài khoản</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">LL-{2000 + tenant.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-card flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử hoạt động
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Profile & Docs */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          {/* Profile Card */}
          <Card className="relative overflow-hidden text-center">
            <div className="bg-primary/10 absolute top-0 left-0 h-24 w-full"></div>
            <CardContent className="flex flex-col items-center p-6 pt-8">
              <div className="bg-card border-card relative z-10 mb-4 h-24 w-24 rounded-full border-4 p-1 shadow-sm">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-4xl font-bold text-blue-700">
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
                {isActive && (
                  <div
                    className="border-card absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-green-500 shadow-sm"
                    title="Đã xác thực"
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-foreground mb-1 text-xl font-bold">{tenant.name}</h2>
              <p className="text-muted-foreground mb-6 text-sm">Chủ trọ cấp 2 (Silver)</p>

              <div className="border-border mt-2 grid w-full grid-cols-2 gap-4 border-t pt-6">
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                    Tin đăng
                  </span>
                  <span className="text-primary text-2xl font-bold">12</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                    Đánh giá
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-2xl font-bold">4.8</span>
                    <Star className="h-5 w-5 fill-amber-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-foreground mb-4 text-lg font-bold">Thông tin liên hệ</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Mail className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase">Email</p>
                    <p className="text-foreground mt-0.5 text-sm font-medium">
                      {tenant.owner?.email || `landlord${tenant.id}@example.com`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Phone className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase">Số điện thoại</p>
                    <p className="text-foreground mt-0.5 text-sm font-medium">0912 345 67{tenant.id % 10}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase">Địa chỉ đăng ký</p>
                    <p className="text-foreground mt-0.5 text-sm font-medium">
                      123 Đường Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, TP. HCM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-bold">Giấy tờ tùy thân</h3>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Đã duyệt</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {['CCCD_MatTruoc.jpg', 'CCCD_MatSau.jpg'].map((doc, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-muted/30 hover:bg-muted group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="bg-background text-primary border-border flex h-10 w-10 items-center justify-center rounded border">
                      <span className="text-xs font-bold">ID</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">{doc}</p>
                      <p className="text-muted-foreground text-xs">Tải lên: 12/10/2023</p>
                    </div>
                    <Download className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Business Entities & Control Panel */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* Account Control Panel */}
          <Card className="border-l-primary border-l-4">
            <CardContent className="p-6">
              <div className="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-foreground mb-1 text-lg font-bold">Trạng thái tài khoản</h3>
                  <p className="text-muted-foreground text-sm">
                    Quản lý quyền truy cập và hoạt động của chủ trọ trên hệ thống.
                  </p>
                </div>
                {isActive && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 flex items-center gap-2 px-4 py-2"
                  >
                    <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
                    <span className="tracking-wider uppercase">Đang hoạt động</span>
                  </Badge>
                )}
                {isSuspended && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-2 border-amber-200 bg-amber-100 px-4 py-2 text-amber-700"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="tracking-wider uppercase">Đang bị khóa</span>
                  </Badge>
                )}
                {isBanned && (
                  <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2">
                    <Ban className="h-4 w-4" />
                    <span className="tracking-wider uppercase">Bị cấm vĩnh viễn</span>
                  </Badge>
                )}
              </div>

              <div className="border-border grid grid-cols-1 gap-4 border-t pt-6 md:grid-cols-3">
                <Button
                  variant="outline"
                  className={`h-auto flex-col items-center justify-center gap-2 p-4 ${isSuspended ? 'border-primary bg-primary/5 text-primary' : ''}`}
                  disabled={isBanned || isSuspended}
                  onClick={() => setSuspendDialogOpen(true)}
                >
                  <div
                    className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${isSuspended ? 'bg-primary text-primary-foreground' : 'bg-amber-100 text-amber-600'}`}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{isSuspended ? 'Đang tạm khóa' : 'Tạm khóa'}</span>
                  <span className="text-muted-foreground text-center text-xs font-normal text-wrap">
                    Giới hạn đăng tin mới
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center gap-2 p-4"
                  disabled={isActive || isBanned}
                >
                  <div
                    className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${isActive ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-600'}`}
                  >
                    <LockOpen className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">Mở khóa</span>
                  <span className="text-muted-foreground text-center text-xs font-normal text-wrap">
                    Khôi phục quyền truy cập
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className={`h-auto flex-col items-center justify-center gap-2 p-4 hover:border-red-200 hover:bg-red-50 hover:text-red-700 ${isBanned ? 'border-red-500 bg-red-50 text-red-700' : 'border-red-200 text-red-600'}`}
                  disabled={isBanned}
                  onClick={() => setBanDialogOpen(true)}
                >
                  <div
                    className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${isBanned ? 'bg-red-600 text-white' : 'bg-red-100'}`}
                  >
                    <Ban className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">Cấm vĩnh viễn</span>
                  <span className="text-muted-foreground text-center text-xs font-normal text-wrap">
                    Hủy toàn bộ dịch vụ
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Entities List */}
          <Card className="flex flex-col overflow-hidden">
            <div className="border-border flex items-center justify-between border-b p-6">
              <div>
                <h3 className="text-foreground text-lg font-bold">Cơ sở kinh doanh</h3>
                <p className="text-muted-foreground mt-1 text-sm">Danh sách nhà trọ/chung cư mini thuộc sở hữu</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tổng cộng: 3 cơ sở</Badge>
            </div>
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Tên cơ sở</TableHead>
                    <TableHead className="font-semibold">Khu vực</TableHead>
                    <TableHead className="font-semibold">Số phòng</TableHead>
                    <TableHead className="font-semibold">Tỷ lệ lấp đầy</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
                          <Home className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">CHMN An Phú</p>
                          <p className="text-muted-foreground text-xs">ID: BLD-001</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Quận 2, TP.HCM</TableCell>
                    <TableCell>24 phòng</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
                          <div className="h-full w-[90%] bg-green-500"></div>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">90%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
                          <Home className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Dãy trọ sinh viên C5</p>
                          <p className="text-muted-foreground text-xs">ID: BLD-042</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Thủ Đức, TP.HCM</TableCell>
                    <TableCell>15 phòng</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
                          <div className="h-full w-[60%] bg-amber-500"></div>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">60%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Service Plan Subscriptions */}
          <Card className="relative overflow-hidden">
            <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-3xl"></div>
            <CardContent className="relative z-10 p-6">
              <h3 className="text-foreground mb-4 text-lg font-bold">Gói dịch vụ đang sử dụng</h3>
              <div className="to-primary flex flex-col gap-6 rounded-lg bg-gradient-to-r from-blue-600 p-5 text-white shadow-md sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold tracking-wider text-white/80 uppercase">Gói hiện tại</p>
                  <h4 className="text-xl font-bold">Premium Landlord</h4>
                  <p className="mt-1 text-sm text-white/90">Đăng tối đa 50 tin • Đẩy tin VIP tự động</p>
                </div>
                <div className="mt-4 border-t border-white/20 pt-4 sm:mt-0 sm:border-t-0 sm:pt-0 sm:text-right">
                  <p className="mb-1 text-xs font-semibold tracking-wider text-white/80 uppercase">Hết hạn vào</p>
                  <p className="text-lg font-bold">15/12/2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Lock className="h-5 w-5" />
              Tạm khóa tài khoản
            </DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do khóa tài khoản này. Lý do này sẽ được ghi vào nhật ký hệ thống và có thể gửi email
              thông báo cho chủ trọ.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="suspend-reason" className="text-foreground">
              Lý do khóa <span className="text-destructive">*</span>
            </Label>
            <textarea id="suspend-reason" className="mt-2 resize-none" placeholder="Nhập lý do chi tiết..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button className="bg-amber-500 text-white hover:bg-amber-600" onClick={() => setSuspendDialogOpen(false)}>
              Xác nhận khóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="border-t-destructive border-t-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Cấm vĩnh viễn tài khoản
            </DialogTitle>
          </DialogHeader>

          <div className="bg-destructive/10 border-destructive/20 mt-2 mb-4 rounded-md border p-3">
            <p className="text-destructive flex items-start gap-2 text-sm font-medium">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Hành động này không thể hoàn tác. Toàn bộ tin đăng và cơ sở của chủ trọ sẽ bị gỡ khỏi hệ thống.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ban-category" className="text-foreground">
                Lý do vi phạm nghiêm trọng <span className="text-destructive">*</span>
              </Label>
              <Select>
                <SelectTrigger id="ban-category">
                  <SelectValue placeholder="-- Chọn danh mục vi phạm --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lừa đảo người thuê</SelectItem>
                  <SelectItem value="2">Cung cấp thông tin giả mạo</SelectItem>
                  <SelectItem value="3">Vi phạm chính sách nhiều lần</SelectItem>
                  <SelectItem value="4">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ban-details" className="text-foreground">
                Chi tiết thêm
              </Label>
              <textarea
                id="ban-details"
                className="resize-none"
                placeholder="Mô tả cụ thể hành vi vi phạm..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={() => setBanDialogOpen(false)}>
              Đình chỉ ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

