import { useState } from 'react'
import { Plus, Loader2, Package, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAssetCategories, useRoomAssets, useCreateRoomAsset, useDeleteRoomAsset } from '@/shared/api/assets'
import type { AssetCondition } from '@/types/asset'
import { useAuth } from '@/shared/hooks/use-auth'

export function RoomAssets({ roomId }: { roomId: number }) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string>('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState<AssetCondition>('NEW')
  const [description, setDescription] = useState('')

  const { data: categoriesData, isLoading: isLoadingCategories } = useAssetCategories({ limit: 100 })
  const { data: assetsData, isLoading: isLoadingAssets } = useRoomAssets(roomId, { limit: 100 })

  const createAsset = useCreateRoomAsset(roomId)
  const deleteAsset = useDeleteRoomAsset(roomId)

  const categories = categoriesData?.data || []
  const assets = assetsData?.data || []

  const handleAddAsset = () => {
    if (!categoryId || !name.trim() || !quantity) {
      toast.error('Vui lòng điền đầy đủ tên, danh mục và số lượng')
      return
    }

    createAsset.mutate(
      {
        categoryId: Number(categoryId),
        name,
        quantity: Number(quantity),
        condition,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã thêm tài sản thành công')
          setIsOpen(false)
          setCategoryId('')
          setName('')
          setQuantity('1')
          setDescription('')
          queryClient.invalidateQueries({ queryKey: ['room-assets', tenantId, roomId] })
        },
        onError: () => toast.error('Lỗi khi thêm tài sản'),
      },
    )
  }

  const handleDeleteAsset = (assetId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài sản này khỏi phòng?')) {
      deleteAsset.mutate(assetId, {
        onSuccess: () => {
          toast.success('Đã xóa tài sản')
        },
        onError: () => {
          toast.error('Lỗi khi xóa tài sản')
        },
      })
    }
  }
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <CardTitle className="text-lg text-slate-800">Tài sản phòng</CardTitle>
          <CardDescription>Danh sách trang thiết bị, nội thất có trong phòng</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Thêm tài sản
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm tài sản vào phòng</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <div className="p-2 text-center text-sm">Đang tải...</div>
                    ) : categories.length === 0 ? (
                      <div className="p-2 text-center text-sm">Chưa có danh mục nào</div>
                    ) : (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên tài sản</Label>
                <Input
                  id="name"
                  placeholder="VD: Điều hòa Panasonic 9000BTU"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tình trạng</Label>
                  <Select value={condition} onValueChange={setCondition as (value: string) => void}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">Mới</SelectItem>
                      <SelectItem value="GOOD">Tốt</SelectItem>
                      <SelectItem value="NORMAL">Bình thường</SelectItem>
                      <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
                      <SelectItem value="LOST">Mất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả thêm</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddAsset} disabled={createAsset.isPending}>
                {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingAssets ? (
          <div className="flex justify-center py-8 text-slate-500">Đang tải dữ liệu...</div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{asset.name}</div>
                    <div className="text-sm text-slate-500">
                      SL: {asset.quantity} • Tình trạng:{' '}
                      {asset.condition === 'NEW'
                        ? 'Mới'
                        : asset.condition === 'GOOD'
                          ? 'Tốt'
                          : asset.condition === 'NORMAL'
                            ? 'Bình thường'
                            : asset.condition === 'DAMAGED'
                              ? 'Hư hỏng'
                              : 'Mất'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteAsset(asset.id)}
                  disabled={deleteAsset.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="mb-3 h-12 w-12 text-slate-300" />
            <p className="font-medium text-slate-600">Chưa có tài sản nào</p>
            <p className="text-sm">Bấm "Thêm tài sản" để quản lý thiết bị trong phòng.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
