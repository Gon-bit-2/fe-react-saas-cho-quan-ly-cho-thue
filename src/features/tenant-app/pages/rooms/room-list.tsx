import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRooms, useProperties } from '@/shared/api/properties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, DoorOpen, Building2 } from 'lucide-react'
import type { Room, Property } from '@/features/tenant-app/types'

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: propertiesData } = useProperties()
  const { data, isLoading } = useRooms({
    search: searchTerm,
    propertyId: propertyFilter !== 'all' ? Number(propertyFilter) : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">Phòng trống</Badge>
      case 'OCCUPIED':
        return (
          <Badge variant="secondary" className="border-blue-200 bg-blue-500/10 text-blue-700">
            Đang thuê
          </Badge>
        )
      case 'MAINTENANCE':
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600">
            Bảo trì
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMarketplaceBadge = (status: string) => {
    if (status === 'PUBLISHED')
      return (
        <Badge variant="default" className="text-[10px]">
          Marketplace
        </Badge>
      )
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Danh sách phòng</h2>
          <p className="text-muted-foreground">Quản lý trạng thái và thông tin của tất cả các phòng</p>
        </div>
        <Button onClick={() => navigate('/app/rooms/new')}>
          <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Tìm theo mã phòng..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả nhà trọ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhà trọ</SelectItem>
            {propertiesData?.data?.map((p: Property) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="AVAILABLE">Phòng trống</SelectItem>
            <SelectItem value="OCCUPIED">Đang thuê</SelectItem>
            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[250px]">Mã phòng</TableHead>
              <TableHead>Nhà trọ / Cơ sở</TableHead>
              <TableHead className="text-right">Giá thuê</TableHead>
              <TableHead className="text-center">Diện tích (m²)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="border-primary/30 border-t-primary h-6 w-6 animate-spin rounded-full border-4" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                  Không tìm thấy phòng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((room: Room) => {
                const property = propertiesData?.data.find((p: Property) => p.id === room.propertyId)

                return (
                  <TableRow key={room.id} className="group transition-colors hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <DoorOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            {room.roomCode}
                            {getMarketplaceBadge(room.marketplaceStatus)}
                          </div>
                          <div className="mt-0.5 text-sm text-slate-500">Tầng {room.floor}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{property?.name || `Tòa nhà #${room.propertyId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      {new Intl.NumberFormat('vi-VN').format(room.basePrice)}đ
                    </TableCell>
                    <TableCell className="text-center text-slate-600">{room.area}</TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/app/rooms/${room.id}/edit`)}>
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
