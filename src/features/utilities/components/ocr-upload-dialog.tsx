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
import { Sparkles, Loader2, Check } from 'lucide-react'

interface OcrJobData {
  id: number
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'NEED_REVIEW'
  recognizedValue?: number | null
}

interface OcrUploadDialogProps {
  open: boolean
  onOpenChange: (val: boolean) => void
  meterId: number
  billingMonth: string
  meterName: string
  onSuccess?: () => void
}

/**
 * Hộp thoại quét ảnh công tơ nhanh bằng AI OCR từ danh sách bảng chỉ số.
 * Cho phép người dùng tải ảnh hoặc sửa tay chỉ số đọc được.
 */
export function OcrUploadDialog({
  open,
  onOpenChange,
  meterId,
  billingMonth,
  meterName,
  onSuccess,
}: OcrUploadDialogProps) {
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
        await ocrControllerAccept(ocrJobId, { billingMonth, currentValue: Number(currentValue) })
      } else {
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
          <DialogTitle className="text-xl font-bold text-slate-900">
            Quét & Cập Nhật Chỉ Số
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            {meterName} • Kỳ chốt {billingMonth}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Khu vực Upload ảnh OCR */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Tải ảnh công tơ (AI OCR)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading || isPolling || isSaving}
                className="h-9 text-xs file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {(isUploading || isPolling) && (
              <p className="flex items-center gap-1.5 text-xs text-purple-600 font-medium pt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isUploading ? 'Đang tải ảnh lên máy chủ...' : 'AI đang bóc tách số từ ảnh...'}
              </p>
            )}
          </div>

          {/* Ô nhập chỉ số */}
          <div className="space-y-1.5">
            <Label htmlFor="currentValue" className="text-xs font-semibold text-slate-700">
              Chỉ số ghi nhận *
            </Label>
            <Input
              id="currentValue"
              type="number"
              min="0"
              step="any"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="VD: 1450"
              className="h-10 font-mono text-base font-bold tabular-nums"
              disabled={isUploading || isPolling || isSaving}
            />
            <p className="text-xs text-slate-400">
              AI sẽ tự động điền nếu nhận diện thành công, bạn có thể chỉnh sửa nếu cần.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9 text-xs"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading || isPolling}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? 'Đang lưu...' : 'Lưu chỉ số'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
