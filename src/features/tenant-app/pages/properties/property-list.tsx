import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProperties } from '@/shared/api/properties'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Building2, MapPin } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useProperties({ search: searchTerm })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Hoạt động</Badge>
      case 'MAINTENANCE':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Bảo trì</Badge>
      default:
        return <Badge variant="outline">Đóng cửa</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    if (type === 'APARTMENT') return <Badge variant="outline">Chung cư mini</Badge>
    if (type === 'ROOM') return <Badge variant="outline">Phòng trọ</Badge>
    return <Badge variant="outline">{type}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý nhà trọ</h2>
          <p className="text-muted-foreground">Danh sách tất cả các cơ sở/tòa nhà của bạn</p>
        </div>
        <Button onClick={() => navigate('/app/properties/new')}>
          <Plus className="mr-2 h-4 w-4" /> Thêm nhà trọ
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Tòa nhà</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-center">Số tầng</TableHead>
              <TableHead className="text-center">Số phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy nhà trọ nào.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((property: Property) => (
                <TableRow key={property.id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/app/properties/${property.id}`)}>
                          {property.name}
                        </div>
                        <div className="mt-1">
                          {getTypeBadge(property.propertyType)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <span className="text-sm line-clamp-2">
                        {property.address}, {property.ward}, {property.district}, {property.province}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 font-medium">
                    {property.floorsCount}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                      {property.roomsCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(property.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/app/properties/${property.id}/edit`)}>
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
