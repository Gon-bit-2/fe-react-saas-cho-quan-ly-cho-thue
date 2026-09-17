import { useState } from 'react'
import { useAssetCategories } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Search, Package, Loader2 } from 'lucide-react'
import { AssetCategoryForm } from './components/asset-category-form'
import type { AssetCategory } from '@/types/asset'
import { formatDate } from '@/shared/lib/utils'

/**
 * Trang quản lý danh mục tài sản và trang thiết bị của chủ trọ
 * Phân loại các tài sản trong phòng trọ như điện gia dụng, nội thất gỗ, khóa an ninh...
 */
export default function AssetList() {
  const { data, isLoading } = useAssetCategories()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null)

  /**
   * Mở modal chỉnh sửa thông tin danh mục đã chọn
   */
  const handleEdit = (category: AssetCategory) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  /**
   * Mở modal tạo mới một danh mục tài sản
   */
  const handleCreate = () => {
    setSelectedCategory(null)
    setFormOpen(true)
  }

  const allCategories = data?.data || []
  const filteredCategories = allCategories.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  )
  
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh mục tài sản</h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân loại trang thiết bị, nội thất để dễ dàng quản lý và kiểm kê theo từng phòng.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>
      
      {/* Main Table Card */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách nhóm danh mục</CardTitle>
          <CardDescription>Tổng số: {filteredCategories.length} danh mục</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm font-medium">Đang tải danh mục tài sản...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">
                {searchTerm ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục tài sản nào'}
              </p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Vui lòng thử lại với từ khóa khác' : 'Nhấn "Thêm danh mục" để tạo danh mục đầu tiên.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="w-28 font-semibold text-slate-600">Mã</TableHead>
                  <TableHead className="font-semibold text-slate-600">Tên danh mục</TableHead>
                  <TableHead className="w-40 font-semibold text-slate-600">Ngày tạo</TableHead>
                  <TableHead className="w-24 text-right font-semibold text-slate-600">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-medium text-slate-500 tabular-nums">
                      CAT-{item.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.name}</div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm tabular-nums">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AssetCategoryForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        initialData={selectedCategory} 
      />
    </div>
  )
}
