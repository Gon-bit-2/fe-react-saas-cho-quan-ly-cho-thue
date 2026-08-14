import { useAssetCategories } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AssetList() {
  const { data, isLoading } = useAssetCategories()
  
  if (isLoading) return <div>Đang tải...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Danh mục tài sản</h1>
        <Button>
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
                    <Button variant="outline" size="sm">Sửa</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
