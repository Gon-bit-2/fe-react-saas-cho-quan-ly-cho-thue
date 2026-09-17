import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProperties } from '@/shared/api/properties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { PROPERTY_STATUS_MAP, PROPERTY_TYPE_MAP } from '@/shared/constants/status-config'
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Grid, 
  List, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Layers, 
  DoorClosed,
  ChevronRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Property } from '@/features/tenant-app/types'

/**
 * Trang Danh sách khu trọ / Tòa nhà cho thuê.
 * Hỗ trợ tìm kiếm theo tên hoặc địa chỉ, chuyển đổi xem dạng Bảng (Table) hoặc Lưới (Grid).
 */
export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const { data, isLoading } = useProperties(searchTerm ? { search: searchTerm } : {})

  const properties = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý khu trọ & cơ sở</h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách tất cả các tòa nhà, chung cư mini và dãy trọ thuộc tài khoản của bạn
          </p>
        </div>
        <Button
          onClick={() => navigate('/khu-tro/tao-moi')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm h-9 px-4 text-sm"
        >
          <Plus className="h-4 w-4" /> Thêm khu trọ mới
        </Button>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo tên khu trọ hoặc địa chỉ..."
            className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus-visible:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 hidden sm:inline mr-1">Chế độ xem:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 rounded-md text-xs gap-1.5 font-medium transition-all ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" />
              <span>Bảng</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 rounded-md text-xs gap-1.5 font-medium transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Lưới</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table or Grid */}
      {viewMode === 'list' ? (
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[320px] font-semibold text-slate-700 text-xs uppercase tracking-wider py-3">
                    Khu trọ / Tòa nhà
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                    Địa chỉ
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-center w-[100px]">
                    Số tầng
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-center w-[120px]">
                    Tổng phòng
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider w-[140px]">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs uppercase tracking-wider text-right pr-6 w-[100px]">
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
                        <span className="text-xs text-slate-500">Đang tải danh sách khu trọ...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : properties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Không tìm thấy khu trọ nào</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => navigate('/khu-tro/tao-moi')}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Thêm khu trọ mới
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((property: Property) => (
                    <TableRow
                      key={property.id}
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {property.coverImageUrl ? (
                              <img
                                src={property.coverImageUrl}
                                alt={property.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/khu-tro/${property.id}`)}
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm text-left truncate block max-w-[220px]"
                            >
                              {property.name}
                            </button>
                            <div className="mt-0.5">
                              <StatusBadge
                                status={property.type}
                                statusMap={PROPERTY_TYPE_MAP}
                                fallbackLabel={property.type}
                                className="text-[10px] py-0 px-1.5 font-normal border-slate-200 text-slate-600 bg-slate-50"
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 max-w-sm">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {property.addressDetail}, {property.ward}, {property.district}, {property.province}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-slate-700 tabular-nums">
                        {property._count?.floors || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 tabular-nums">
                          {property._count?.rooms || 0} phòng
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={property.status}
                          statusMap={PROPERTY_STATUS_MAP}
                          fallbackLabel={property.status}
                          className="text-xs font-medium"
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
                            <DropdownMenuItem onClick={() => navigate(`/khu-tro/${property.id}`)} className="text-xs gap-2 cursor-pointer">
                              <Eye className="h-3.5 w-3.5 text-slate-500" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/khu-tro/${property.id}/chinh-sua`)} className="text-xs gap-2 cursor-pointer">
                              <Edit className="h-3.5 w-3.5 text-slate-500" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/quan-ly-phong/tao-moi?propertyId=${property.id}`)} className="text-xs gap-2 cursor-pointer text-blue-600">
                              <Plus className="h-3.5 w-3.5" />
                              Thêm phòng mới
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <span className="font-semibold text-slate-700 tabular-nums">{properties.length}</span> trên tổng số <span className="font-semibold text-slate-700 tabular-nums">{data?.meta?.total || properties.length}</span> khu trọ
            </span>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Không tìm thấy khu trọ nào</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: Property) => (
                <Card 
                  key={property.id} 
                  className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/khu-tro/${property.id}`)}
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                    {property.coverImageUrl ? (
                      <img
                        src={property.coverImageUrl}
                        alt={property.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Building2 className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status={property.status}
                        statusMap={PROPERTY_STATUS_MAP}
                        fallbackLabel={property.status}
                        className="shadow-sm"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-base group-hover:text-blue-600 transition-colors truncate">
                          {property.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 flex items-start gap-1 line-clamp-2 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{property.addressDetail}, {property.ward}, {property.district}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Layers className="h-3.5 w-3.5 text-slate-400" />
                          {property._count?.floors || 0} tầng
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <DoorClosed className="h-3.5 w-3.5 text-slate-400" />
                          {property._count?.rooms || 0} phòng
                        </span>
                      </div>
                      <span className="text-blue-600 font-medium flex items-center group-hover:translate-x-0.5 transition-transform">
                        Chi tiết <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
