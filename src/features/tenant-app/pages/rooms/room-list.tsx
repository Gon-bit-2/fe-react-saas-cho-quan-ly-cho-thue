import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRooms, useProperties } from '@/shared/api/properties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { ROOM_STATUS_MAP, MARKETPLACE_STATUS_MAP } from '@/shared/constants/status-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  DoorOpen, 
  Building2, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Armchair,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Property, Room } from '@/features/tenant-app/types'
import { formatCurrency } from '@/shared/lib/utils'

/**
 * Trang Danh sách phòng cho thuê thuộc quyền quản lý của chủ trọ.
 * Hỗ trợ tìm kiếm theo mã phòng/tên, lọc theo khu trọ và trạng thái phòng (Trống, Đang thuê, Bảo trì).
 */
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

  const rooms = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý danh sách phòng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi trạng thái thuê, diện tích và cấu hình giá của từng phòng trọ
          </p>
        </div>
        <Button 
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm h-9 px-4 text-sm" 
          onClick={() => navigate('/quan-ly-phong/tao-moi')}
        >
          <Plus className="h-4 w-4" /> Thêm phòng mới
        </Button>
      </div>

      {/* Filters Section */}
      <div className="grid gap-3 sm:grid-cols-12 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative sm:col-span-6 lg:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo mã phòng hoặc tiêu đề..."
            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="sm:col-span-3 lg:col-span-4">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="h-9 text-xs border-slate-200 bg-slate-50">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder="Tất cả khu trọ" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tất cả khu trọ</SelectItem>
              {propertiesData?.data?.map((p: Property) => (
                <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3 lg:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs border-slate-200 bg-slate-50">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">Tất cả trạng thái</SelectItem>
              <SelectItem value="AVAILABLE" className="text-xs">Phòng trống</SelectItem>
              <SelectItem value="OCCUPIED" className="text-xs">Đang cho thuê</SelectItem>
              <SelectItem value="MAINTENANCE" className="text-xs">Đang bảo trì</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px] font-semibold text-slate-700 text-xs uppercase tracking-wider py-3">
                  Mã & Tên phòng
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                  Khu trọ / Cơ sở
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">
                  Giá thuê
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-center">
                  Diện tích
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                  Trạng thái
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                      <span className="text-xs text-slate-500">Đang tải danh sách phòng...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <DoorOpen className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Không tìm thấy phòng nào phù hợp</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => navigate('/quan-ly-phong/tao-moi')}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Thêm phòng mới
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room: Room) => {
                  const property = propertiesData?.data.find((p: Property) => p.id === room.propertyId)

                  return (
                    <TableRow 
                      key={room.id} 
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {room.images && room.images.length > 0 ? (
                              <img src={room.images[0].url} alt={room.roomCode} className="h-full w-full object-cover" />
                            ) : (
                              <DoorOpen className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/quan-ly-phong/${room.id}/chi-tiet`)}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm text-left truncate"
                              >
                                {room.roomCode}
                              </button>
                              {room.marketplaceStatus === 'PUBLISHED' && (
                                <StatusBadge
                                  status={room.marketplaceStatus}
                                  statusMap={MARKETPLACE_STATUS_MAP}
                                  fallbackLabel="Marketplace"
                                  className="text-[9px] py-0 px-1"
                                />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">
                              {room.title || `Phòng ${room.roomCode}`} • {room.floor?.name || `Tầng ${room.floorId || 'N/A'}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[200px] truncate">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{property?.name || `Tòa nhà #${room.propertyId}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-slate-900 text-sm tabular-nums">
                          {formatCurrency(room.basePrice)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-slate-700 tabular-nums">
                        {room.area} m²
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={room.status} 
                          statusMap={ROOM_STATUS_MAP} 
                          fallbackLabel={room.status}
                          className="text-xs"
                        />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-slate-500">Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/quan-ly-phong/${room.id}/chi-tiet`)} className="text-xs gap-2 cursor-pointer">
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/quan-ly-phong/${room.id}/chinh-sua`)} className="text-xs gap-2 cursor-pointer">
                              <Edit className="h-3.5 w-3.5 text-slate-500" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/quan-ly-tai-san/phong/${room.id}`)} className="text-xs gap-2 cursor-pointer text-indigo-600">
                              <Armchair className="h-3.5 w-3.5" />
                              Tài sản phòng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <span className="font-semibold text-slate-700 tabular-nums">{rooms.length}</span> phòng
          </span>
        </div>
      </Card>
    </div>
  )
}
