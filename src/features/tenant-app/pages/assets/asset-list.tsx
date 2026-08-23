import { useState } from 'react'
import { useAssetCategories } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Edit2 } from 'lucide-react'
import { AssetCategoryForm } from './components/asset-category-form'
import type { AssetCategory } from '@/types/asset'


export default function AssetList() {
  const { data, isLoading } = useAssetCategories()
  
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null)

  const handleEdit = (category: AssetCategory) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormOpen(true)
  }
  
  if (isLoading) return <div>Đang tải...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Danh mục tài sản</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục tài sản</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã (ID)</TableHead>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">CAT-{item.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
