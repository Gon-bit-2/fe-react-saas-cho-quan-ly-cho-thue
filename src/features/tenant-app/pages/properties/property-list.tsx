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
import { Plus, Search, Building2, MapPin, Grid, List } from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const { data, isLoading } = useProperties({ search: searchTerm })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-label-sm uppercase tracking-wider shadow-none">Hoạt động</Badge>
      case 'MAINTENANCE':
        return <Badge className="bg-status-warning/10 text-status-warning hover:bg-status-warning/20 border-none font-label-sm uppercase tracking-wider shadow-none">Bảo trì</Badge>
      default:
        return <Badge variant="outline" className="text-on-surface-variant border-surface-border font-label-sm uppercase tracking-wider shadow-none">Đóng cửa</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    if (type === 'APARTMENT') return <Badge variant="outline" className="font-label-sm text-on-surface-variant bg-surface-container-lowest shadow-none border-surface-border">Chung cư mini</Badge>
    if (type === 'ROOM') return <Badge variant="outline" className="font-label-sm text-on-surface-variant bg-surface-container-lowest shadow-none border-surface-border">Phòng trọ</Badge>
    return <Badge variant="outline" className="font-label-sm text-on-surface-variant bg-surface-container-lowest shadow-none border-surface-border">{type}</Badge>
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-128px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Quản lý nhà trọ</h1>
          <p className="font-body-md text-on-surface-variant">Danh sách tất cả các cơ sở, tòa nhà và khu trọ của bạn</p>
        </div>
        <Button onClick={() => navigate('/khu-tro/tao-moi')} className="bg-primary text-on-primary hover:bg-primary/90 font-label-md rounded-full px-6 h-10 shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhà trọ mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
          <Input
            type="search"
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="pl-10 h-10 bg-surface border-surface-border rounded-xl font-body-md focus-visible:ring-primary/20 focus-visible:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl border border-surface-border">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="border-surface-border hover:bg-transparent">
                <TableHead className="w-[350px] font-label-md text-on-surface uppercase tracking-wider py-4">Tòa nhà</TableHead>
                <TableHead className="font-label-md text-on-surface uppercase tracking-wider">Địa chỉ</TableHead>
                <TableHead className="text-center font-label-md text-on-surface uppercase tracking-wider">Số tầng</TableHead>
                <TableHead className="text-center font-label-md text-on-surface uppercase tracking-wider">Phòng</TableHead>
                <TableHead className="font-label-md text-on-surface uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="text-right font-label-md text-on-surface uppercase tracking-wider pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex justify-center items-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <p className="font-body-md text-on-surface-variant">Không tìm thấy nhà trọ nào.</p>
                      <Button variant="link" className="text-primary font-label-md" onClick={() => navigate('/khu-tro/tao-moi')}>
                        Thêm nhà trọ mới
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((property: Property) => (
                  <TableRow key={property.id} className="group hover:bg-surface-container-low/30 border-surface-border transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 border border-primary/10 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                          <Building2 className="h-6 w-6" />
                          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div 
                            className="font-headline-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer" 
                            onClick={() => navigate(`/khu-tro/${property.id}`)}
                          >
                            {property.name}
                          </div>
                          <div>
                            {getTypeBadge(property.propertyType)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-on-surface-variant max-w-sm">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-tertiary" />
                        <span className="font-body-sm line-clamp-2 leading-relaxed">
                          {property.address}, {property.ward}, {property.district}, {property.province}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-body-md text-on-surface">
                      {property.floorsCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-surface-border font-label-md text-on-surface shadow-sm">
                        {property.roomsCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(property.status)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
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
        <div className="p-4 border-t border-surface-border bg-surface-container-low/30 flex items-center justify-between text-on-surface-variant font-body-sm">
          <span>Hiển thị {data?.data.length || 0} trên tổng số {data?.data.length || 0} kết quả</span>
        </div>
      </div>
    </div>
  )
}
