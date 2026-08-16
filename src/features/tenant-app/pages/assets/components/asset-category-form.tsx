import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAssetCategory, useUpdateAssetCategory } from '@/shared/api/assets'
import type { AssetCategory } from '@/types/asset'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AssetCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AssetCategory | null
}

export function AssetCategoryForm({ open, onOpenChange, initialData }: AssetCategoryFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevData, setPrevData] = useState(initialData)

  if (open !== prevOpen || initialData !== prevData) {
    setPrevOpen(open)
    setPrevData(initialData)
    if (open) {
      setName(initialData?.name || '')
      setDescription(initialData?.description || '')
    }
  }

  const createCategory = useCreateAssetCategory()
  const updateCategory = useUpdateAssetCategory(initialData?.id || 0)

  const isEditing = !!initialData
  const isPending = createCategory.isPending || updateCategory.isPending

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    const payload = { name, description }

    if (isEditing) {
      updateCategory.mutate(payload, {
        onSuccess: () => {
          toast.success('Cập nhật danh mục thành công')
          onOpenChange(false)
        },
        onError: () => toast.error('Lỗi khi cập nhật danh mục'),
      })
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo danh mục thành công')
          onOpenChange(false)
        },
        onError: () => toast.error('Lỗi khi tạo danh mục'),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Nội thất gỗ, Thiết bị điện..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chi tiết về danh mục này"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
