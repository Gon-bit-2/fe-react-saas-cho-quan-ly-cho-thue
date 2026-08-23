import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadOcr } from '@/shared/api/ocr'
import { ocrControllerGetById, ocrControllerAccept } from '@/shared/api/generated/ocr/ocr'
import { meterReadingsControllerCreate } from '@/shared/api/generated/meter-readings/meter-readings'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface OcrJobData {
  id: number
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'NEED_REVIEW'
  recognizedValue?: number | null
}

export function OcrUploadDialog({
  open,
  onOpenChange,
  meterId,
  billingMonth,
  meterName,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
  meterId: number
  billingMonth: string
  meterName: string
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const { mutateAsync: uploadOcr, isPending: isUploading } = useUploadOcr()

  const [currentValue, setCurrentValue] = useState<number | ''>('')
  const [ocrJobId, setOcrJobId] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset khi mở lại dialog
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setCurrentValue('')
      setOcrJobId(null)
      setIsPolling(false)
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!ocrJobId || !isPolling) return
    const interval = setInterval(async () => {
      try {
        const data = (await ocrControllerGetById(ocrJobId)) as unknown as OcrJobData
        if (data.status === 'SUCCESS' || data.status === 'NEED_REVIEW') {
          setIsPolling(false)
          clearInterval(interval)
          if (data.recognizedValue !== null && data.recognizedValue !== undefined) {
            setCurrentValue(data.recognizedValue)
            if (data.status === 'SUCCESS') {
              toast.success('Đã đọc được chỉ số từ ảnh')
            } else {
              toast.warning('AI đọc được chỉ số nhưng độ tin cậy thấp. Vui lòng kiểm tra lại.')
            }
          } else {
            toast.error('AI không đọc được số, vui lòng nhập tay.')
          }
        } else if (data.status === 'FAILED') {
          setIsPolling(false)
          clearInterval(interval)
          toast.error('AI không thể đọc được ảnh này. Bạn vui lòng nhập tay.')
        }
      } catch {
        setIsPolling(false)
        clearInterval(interval)
        toast.error('Lỗi khi kiểm tra kết quả OCR')
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [ocrJobId, isPolling])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = (await uploadOcr({ meterId, file })) as unknown as OcrJobData
      setOcrJobId(data.id)
      setIsPolling(true)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên')
    } finally {
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (currentValue === '') {
      toast.error('Vui lòng nhập chỉ số')
      return
    }
    setIsSaving(true)
    try {
      if (ocrJobId) {
        // Cập nhật giá trị vào OCR Job và xác nhận luôn
        await ocrControllerAccept(ocrJobId, { billingMonth, currentValue: Number(currentValue) })
      } else {
        // Nếu nhập tay hoàn toàn, không có OCR job
        await meterReadingsControllerCreate({
          meterId,
          billingMonth,
          currentValue: Number(currentValue),
          status: 'DRAFT',
        })
      }
      toast.success('Lưu chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu chỉ số')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật chỉ số</DialogTitle>
          <DialogDescription>{meterName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Quét ảnh (AI OCR)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading || isPolling || isSaving}
              />
            </div>
            {(isUploading || isPolling) && (
              <p className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                {isUploading ? 'Đang tải ảnh...' : 'Hệ thống AI đang đọc ảnh...'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentValue">Chỉ số trên đồng hồ</Label>
            <Input
              id="currentValue"
              type="number"
              min="0"
              step="any"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ví dụ: 1250"
              disabled={isUploading || isPolling || isSaving}
            />
            <p className="text-xs text-slate-500">Bạn có thể tải ảnh lên để máy điền tự động, hoặc tự gõ vào ô này.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading || isPolling}>
            {isSaving ? 'Đang lưu...' : 'Lưu chỉ số'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
