import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Download, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { adminRenterApi } from '../api/tenant.api'
import type { UserProfile } from '@/features/auth/api/types'

export const RentersPage = () => {
  const [renters, setRenters] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRenters = async () => {
      try {
        const response = await adminRenterApi.getRenters()
        if (response.data) {
          setRenters(response.data)
        } else {
          setRenters([])
        }
      } catch (error) {
        setRenters([])
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchRenters()
  }, [])

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      {/* Main Data Table Container */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Table Toolbar */}
        <div className="bg-card border-border relative z-10 flex flex-col items-center justify-between gap-4 border-b p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Filter className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-lg font-bold">Danh sách người thuê</span>
              <span className="text-muted-foreground text-sm">Quản lý và giám sát tất cả tài khoản người thuê.</span>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input placeholder="Tìm kiếm người thuê..." className="bg-muted/50 w-full border-none pl-9" />
            </div>
            <Button variant="secondary" className="flex items-center gap-2 whitespace-nowrap">
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="min-h-[400px] w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Người thuê</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Chủ trọ quản lý</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Xác thực</TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">Trạng thái HĐ</TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : (
                renters.map((renter) => (
                  <TableRow key={renter.id} className="hover:bg-muted/30 group cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {renter.fullName.split(' ').pop()?.charAt(0) || 'U'}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="text-foreground truncate font-medium">{renter.fullName}</span>
                          <span className="text-muted-foreground truncate text-xs">{renter.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground text-sm font-medium">Trần Thị Bích</span>
                        <span className="text-muted-foreground text-xs">ID: LL-9021</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-blue-700">
                        Đã KYC
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-foreground text-sm font-medium">Đang hoạt động</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-card border-border flex items-center justify-between border-t p-4">
          <span className="text-muted-foreground text-sm">Hiển thị 1 đến {renters.length} của 12,450 tài khoản</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="bg-primary h-8 w-8 rounded">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded">
              2
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded">
              3
            </Button>
            <span className="text-muted-foreground flex h-8 w-8 items-center justify-center">...</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
