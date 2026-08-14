import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Verified,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react'
import { adminTenantApi, type Tenant } from '../api/tenant.api'

export const LandlordsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await adminTenantApi.getTenants()
        if (response?.data?.data) {
          setTenants(response.data.data)
        } else {
          setTenants([])
        }
      } catch (error) {
        setTenants([])
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchTenants()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
            Hoạt động
          </Badge>
        )
      case 'INACTIVE':
        return (
          <Badge
            variant="secondary"
            className="flex w-fit items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
            Tạm khóa
          </Badge>
        )
      case 'BANNED':
        return (
          <Badge variant="destructive" className="flex w-fit items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
            Bị cấm
          </Badge>
        )
      default:
        return <Badge variant="secondary">Không rõ</Badge>
    }
  }

  const getVerifBadge = (status: string) => {
    // We will just mock verification for now based on status
    if (status === 'ACTIVE') {
      return (
        <span className="text-primary inline-flex items-center gap-1">
          <Verified className="h-4 w-4" />
          <span className="text-sm font-medium">Đã xác thực</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-amber-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Chờ xác thực</span>
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('vi-VN').format(date)
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Chủ trọ</h1>
          <p className="text-muted-foreground mt-1 text-sm">Quản lý danh sách chủ trọ tham gia hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm chủ trọ mới
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        {/* Toolbar */}
        <div className="bg-card border-border flex flex-col justify-between gap-4 border-b p-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input placeholder="Tìm kiếm theo tên, email, sđt..." className="bg-muted/50 border-none pl-9" />
            </div>
            <Button variant="secondary" className="flex w-full items-center gap-2 md:w-auto">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <Select defaultValue="all-status">
              <SelectTrigger className="bg-muted/50 w-full border-none md:w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Trạng thái: Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="suspended">Tạm khóa</SelectItem>
                <SelectItem value="banned">Cấm vĩnh viễn</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-verif">
              <SelectTrigger className="bg-muted/50 w-full border-none md:w-[160px]">
                <SelectValue placeholder="Xác thực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-verif">Xác thực: Tất cả</SelectItem>
                <SelectItem value="verified">Đã xác thực</SelectItem>
                <SelectItem value="pending">Chờ xác thực</SelectItem>
                <SelectItem value="unverified">Chưa xác thực</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="min-h-[400px] flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <input type="checkbox" className="accent-primary h-4 w-4 cursor-pointer rounded" />
                </TableHead>
                <TableHead className="font-semibold">Chủ trọ</TableHead>
                <TableHead className="font-semibold">Thông tin liên hệ</TableHead>
                <TableHead className="text-center font-semibold">Số phòng/Tòa nhà</TableHead>
                <TableHead className="font-semibold">Xác thực</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold">Ngày đăng ký</TableHead>
                <TableHead className="text-right font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground h-24 text-center">
                    Không tìm thấy chủ trọ nào
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center">
                      <input type="checkbox" className="accent-primary h-4 w-4 cursor-pointer rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-foreground font-semibold">{tenant.name}</div>
                          <div className="text-muted-foreground mt-0.5 text-xs uppercase">
                            ID: LL-{2000 + tenant.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                          <Mail className="h-3.5 w-3.5" />
                          {tenant.owner?.email || `landlord${tenant.id}@example.com`}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                          <Phone className="h-3.5 w-3.5" />
                          090123456{tenant.id % 10}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground text-center text-lg font-bold">
                      {((tenant.id * 13) % 50) + 1}
                    </TableCell>
                    <TableCell>{getVerifBadge(tenant.status)}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary rounded-full"
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground rounded-full"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="bg-card border-border flex flex-col items-center justify-between gap-4 border-t p-4 sm:flex-row">
          <div className="text-muted-foreground text-sm">
            Hiển thị <span className="text-foreground font-semibold">1 - {tenants.length}</span> trong{' '}
            <span className="text-foreground font-semibold">{tenants.length}</span> chủ trọ
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="bg-primary h-8 w-8 rounded-md">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-md" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
