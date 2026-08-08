import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRooms, useProperties } from '@/shared/api/properties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, DoorOpen, Building2, MapPin } from 'lucide-react'
import type { Room } from '@/types/room'
import type { Property } from '@/features/tenant-app/types'

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
        return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 shadow-sm">Phòng trống</Badge>
      case 'OCCUPIED':
        return (
          <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-blue-700 font-medium px-2 py-0.5 shadow-sm">
            Đang thuê
          </Badge>
        )
      case 'MAINTENANCE':
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-medium px-2 py-0.5 shadow-sm">
            Bảo trì
          </Badge>
        )
      default:
        return <Badge variant="outline" className="font-medium px-2 py-0.5 shadow-sm">{status}</Badge>
    }
  }

  const getMarketplaceBadge = (status: string) => {
    if (status === 'PUBLISHED')
      return (
        <Badge variant="default" className="text-[10px] bg-slate-900 text-white font-semibold">
          Marketplace
        </Badge>
      )
    return null
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Danh sách phòng</h2>
          <p className="text-slate-500 mt-1">Quản lý trạng thái và thông tin của tất cả các phòng trong hệ thống</p>
        </div>
        <Button size="lg" className="shadow-sm" onClick={() => navigate('/app/quan-ly-phong/tao-moi')}>
          <Plus className="mr-2 h-4 w-4" /> Thêm phòng mới
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo mã phòng hoặc tên..."
            className="pl-9 bg-slate-50/50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[220px] bg-slate-50/50 border-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Tất cả nhà trọ" />
            </div>
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
          <SelectTrigger className="w-[200px] bg-slate-50/50 border-slate-200">
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

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] py-4 text-slate-600 font-semibold">Phòng</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold">Nhà trọ / Tòa nhà</TableHead>
              <TableHead className="text-right py-4 text-slate-600 font-semibold">Giá thuê</TableHead>
              <TableHead className="text-center py-4 text-slate-600 font-semibold">Diện tích</TableHead>
              <TableHead className="py-4 text-slate-600 font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right py-4 text-slate-600 font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="border-slate-200 border-t-slate-900 h-8 w-8 animate-spin rounded-full border-4" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <DoorOpen className="h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">Không tìm thấy phòng nào phù hợp</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((room: Room) => {
                const property = propertiesData?.data.find((p: Property) => p.id === room.propertyId)

                return (
                  <TableRow key={room.id} className="group transition-colors hover:bg-slate-50/80 cursor-default">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 border border-slate-200/50">
                          <DoorOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-base">{room.roomCode}</span>
                            {getMarketplaceBadge(room.marketplaceStatus)}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">
                            {room.title || `Phòng ${room.roomCode}`} • Tầng {room.floorId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-sm font-medium">{property?.name || `Tòa nhà #${room.propertyId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(room.basePrice)}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">đ</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-slate-700 font-medium">{room.area}</span>
                      <span className="text-slate-500 text-sm ml-1">m²</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                        onClick={() => navigate(`/app/quan-ly-phong/${room.id}/chi-tiet`)}
                      >
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
