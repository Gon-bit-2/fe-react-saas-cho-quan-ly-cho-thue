import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProperties } from '@/shared/api/properties'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { PROPERTY_STATUS_MAP, PROPERTY_TYPE_MAP } from '@/shared/constants/status-config'
import { Plus, Search, Building2, MapPin, Grid, List } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const { data, isLoading } = useProperties(searchTerm ? { search: searchTerm } : {})

  const getStatusBadge = (status: string) => {
    return (
      <StatusBadge
        status={status}
        statusMap={PROPERTY_STATUS_MAP}
        fallbackLabel={status}
        className="font-label-sm border-none tracking-wider uppercase shadow-none"
      />
    )
  }

  const getTypeBadge = (type: string) => {
    return (
      <StatusBadge
        status={type}
        statusMap={PROPERTY_TYPE_MAP}
        fallbackLabel={type}
        className="font-label-sm shadow-none"
      />
    )
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-128px)] flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý nhà trọ</h1>
          <p className="font-body-md text-on-surface-variant">Danh sách tất cả các cơ sở, tòa nhà và khu trọ của bạn</p>
        </div>
        <Button
          onClick={() => navigate('/khu-tro/tao-moi')}
          className="bg-primary text-on-primary hover:bg-primary/90 font-label-md h-10 rounded-full px-6 shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm nhà trọ mới
        </Button>
      </div>

      <div className="bg-surface-container-lowest border-surface-border flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search className="text-on-surface-variant absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="bg-surface border-surface-border font-body-md focus-visible:ring-primary/20 focus-visible:border-primary h-10 rounded-xl pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-surface-container-low border-surface-border flex items-center gap-2 rounded-xl border p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border-surface-border flex flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="border-surface-border hover:bg-transparent">
                <TableHead className="font-label-md text-on-surface w-[350px] py-4 tracking-wider uppercase">
                  Tòa nhà
                </TableHead>
                <TableHead className="font-label-md text-on-surface tracking-wider uppercase">Địa chỉ</TableHead>
                <TableHead className="font-label-md text-on-surface text-center tracking-wider uppercase">
                  Số tầng
                </TableHead>
                <TableHead className="font-label-md text-on-surface text-center tracking-wider uppercase">
                  Phòng
                </TableHead>
                <TableHead className="font-label-md text-on-surface tracking-wider uppercase">Trạng thái</TableHead>
                <TableHead className="font-label-md text-on-surface pr-6 text-right tracking-wider uppercase">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex items-center justify-center">
                      <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-surface-container text-on-surface-variant flex h-12 w-12 items-center justify-center rounded-full">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <p className="font-body-md text-on-surface-variant">Không tìm thấy nhà trọ nào.</p>
                      <Button
                        variant="link"
                        className="text-primary font-label-md"
                        onClick={() => navigate('/khu-tro/tao-moi')}
                      >
                        Thêm nhà trọ mới
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((property: Property) => (
                  <TableRow
                    key={property.id}
                    className="group hover:bg-surface-container-low/30 border-surface-border transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-surface-container-high text-on-surface-variant border-surface-border relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-transform group-hover:scale-105">
                          {property.coverImageUrl ? (
                            <img
                              src={property.coverImageUrl}
                              alt={property.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6" />
                          )}
                          <div className="bg-primary absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div
                            className="font-headline-sm text-on-surface group-hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/khu-tro/${property.id}`)}
                          >
                            {property.name}
                          </div>
                          <div>{getTypeBadge(property.type)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-on-surface-variant flex max-w-sm items-start gap-2">
                        <MapPin className="text-tertiary mt-0.5 h-4 w-4 shrink-0" />
                        <span className="font-body-sm line-clamp-2 leading-relaxed">
                          {property.addressDetail}, {property.ward}, {property.district}, {property.province}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-body-md text-on-surface text-center">
                      {property._count?.floors || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="bg-surface border-surface-border font-label-md text-on-surface inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm">
                        {property._count?.rooms || 0}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(property.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-label-md text-primary hover:bg-primary/10 hover:text-primary rounded-lg"
                        onClick={() => navigate(`/khu-tro/${property.id}`)}
                      >
                        Quản lý
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination placeholder - to be implemented if needed */}
        <div className="border-surface-border bg-surface-container-low/30 text-on-surface-variant font-body-sm flex items-center justify-between border-t p-4">
          <span>
            Hiển thị {data?.data?.length || 0} trên tổng số {data?.meta?.total || 0} kết quả
          </span>
        </div>
      </div>
    </div>
  )
}
