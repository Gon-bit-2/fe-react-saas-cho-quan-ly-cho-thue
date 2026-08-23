import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ImageIcon, ImagePlus, Loader2, Save } from 'lucide-react'
import { useUtilityMetersControllerList, meterReadingsControllerCreate } from '../api'
import { useEffect } from 'react'
import { useUploadOcr } from '@/shared/api/ocr'
import { ocrControllerGetById } from '@/shared/api/generated/ocr/ocr'

const formSchema = z.object({
  meterId: z.coerce.number().int().positive('Vui lòng chọn công tơ'),
  billingMonth: z.string().nonempty('Vui lòng chọn tháng ghi chỉ số'),
  currentValue: z.coerce.number().nonnegative('Chỉ số mới không hợp lệ'),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

interface OcrJobData {
  id: number
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'NEED_REVIEW'
  recognizedValue?: number | null
}

export function MeterReadingUploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [ocrJobId, setOcrJobId] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const { mutateAsync: uploadOcr, isPending: isUploading } = useUploadOcr()

  const { data: metersResponse, isLoading: isLoadingMeters } = useUtilityMetersControllerList({
    limit: 100,
    status: 'ACTIVE',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meters = (metersResponse as unknown as { data?: Array<any> })?.data || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingMonth: new Date().toISOString().substring(0, 7) + '-01',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedMeterId = watch('meterId')
  const selectedMeter = meters.find((m) => m.id === selectedMeterId)

  const { mutate: createReading, isPending } = useMutation({
    mutationFn: async (data: Parameters<typeof meterReadingsControllerCreate>[0]) => {
      // In a real app with file upload endpoint, we would upload the image here
      // and attach the returned URL to `data.imageUrl`.
      // For now, we will just send the data. If backend accepts base64, we could use it.
      return meterReadingsControllerCreate(data)
    },
    onSuccess: () => {
      toast.success('Ghi chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
      navigate('/dien-nuoc/chi-so')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; errors?: unknown } } }
      console.error('Lỗi API:', err.response?.data)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi ghi chỉ số')
    },
  })

  const onSubmit = async (data: FormValues) => {
    // Nếu có hỗ trợ API upload ảnh công tơ, ta sẽ upload ở đây
    const imageUrl = undefined
    if (selectedFile) {
      // imageUrl = await uploadImageAPI(selectedFile)
      // Dùng Data URL tạm thời cho tới khi có API thực (backend có thể không nhận chuỗi quá dài)
      // imageUrl = previewImage
    }

    createReading({
      meterId: data.meterId,
      billingMonth: new Date(data.billingMonth).toISOString(),
      currentValue: data.currentValue,
      status: 'DRAFT',
      imageUrl,
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedMeterId) {
      toast.error('Vui lòng chọn công tơ trước khi tải ảnh')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewImage(url)

    try {
      const data = (await uploadOcr({ meterId: Number(selectedMeterId), file })) as unknown as OcrJobData
      setOcrJobId(data.id)
      setIsPolling(true)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên OCR')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
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
            setValue('currentValue', data.recognizedValue, { shouldValidate: true })
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
  }, [ocrJobId, isPolling, setValue])

  return (
    <div className="animate-in fade-in mx-auto max-w-5xl space-y-8 p-8 pb-12 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ghi Chỉ Số Công Tơ</h2>
          <p className="mt-1 text-slate-500">Tải ảnh công tơ và nhập chỉ số tiêu thụ mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Form Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-6">
              <CardTitle className="text-xl text-slate-800">Thông tin ghi chỉ số</CardTitle>
              <CardDescription>Chọn công tơ và nhập số điện/nước sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-white p-6">
              <div className="space-y-2.5">
                <Label htmlFor="billingMonth" className="font-medium text-slate-700">
                  Kỳ ghi chỉ số <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="billingMonth"
                  type="month"
                  className="border-slate-200 bg-slate-50"
                  defaultValue={new Date().toISOString().substring(0, 7)}
                  onChange={(e) => {
                    setValue('billingMonth', e.target.value ? `${e.target.value}-01` : '')
                  }}
                />
                {errors.billingMonth && (
                  <p className="text-sm font-medium text-red-500">{errors.billingMonth.message}</p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="meterId" className="font-medium text-slate-700">
                  Công Tơ <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(val) => setValue('meterId', Number(val))}>
                  <SelectTrigger
                    className={`border-slate-200 bg-slate-50 ${errors.meterId ? 'border-red-500 ring-red-500' : ''}`}
                  >
                    <SelectValue placeholder={isLoadingMeters ? 'Đang tải...' : 'Chọn công tơ'} />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem key={meter.id} value={meter.id.toString()}>
                        {meter.meterCode} - Phòng {meter.room?.roomCode} (
                        {meter.type === 'ELECTRICITY' ? 'Điện' : 'Nước'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.meterId && <p className="text-sm font-medium text-red-500">{errors.meterId.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="currentValue" className="font-medium text-slate-700">
                  Chỉ số mới {selectedMeter?.unit ? `(${selectedMeter.unit})` : ''}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentValue"
                  type="number"
                  min="0"
                  step="any"
                  className={`border-slate-200 bg-slate-50 font-semibold text-emerald-700 focus-visible:ring-emerald-500 ${errors.currentValue ? 'border-red-500 ring-red-500' : ''}`}
                  placeholder="Nhập chỉ số ghi nhận trên đồng hồ"
                  {...register('currentValue')}
                />
                {errors.currentValue && (
                  <p className="text-sm font-medium text-red-500">{errors.currentValue.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur-md">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 px-6"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isPending || isUploading || isPolling}>
              {isPending || isUploading || isPolling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu Chỉ Số
            </Button>
          </div>
        </div>

        {/* Image Upload Column */}
        <div className="h-[500px] space-y-6">
          <Card className="flex h-full flex-col overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="shrink-0 border-b border-slate-200/60 bg-slate-50/80 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-800">Ảnh minh chứng</CardTitle>
                  <CardDescription>Tải lên ảnh chụp công tơ thực tế</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => {
                    if (!selectedMeterId) {
                      toast.error('Vui lòng chọn công tơ trước khi tải ảnh')
                      return
                    }
                    fileInputRef.current?.click()
                  }}
                  disabled={isUploading || isPolling}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {previewImage ? 'Đổi ảnh' : 'Chọn ảnh'}
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </CardHeader>
            <CardContent className="group relative flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-0">
              {previewImage ? (
                <div className="absolute inset-0 p-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full rounded-lg bg-white object-contain shadow-sm"
                  />
                  {(isUploading || isPolling) && (
                    <div className="absolute inset-4 z-10 flex flex-col items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm">
                      <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                      <p className="font-medium">{isUploading ? 'Đang tải ảnh...' : 'AI đang phân tích...'}</p>
                    </div>
                  )}
                  <div
                    className="absolute inset-4 flex cursor-pointer items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="flex items-center gap-2 font-medium text-white">
                      <ImagePlus className="h-5 w-5" /> Tải ảnh khác
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="m-4 flex h-full min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:bg-slate-200/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mb-4 h-16 w-16 text-slate-300" />
                  <p className="font-medium text-slate-500">Nhấp để chọn ảnh công tơ</p>
                  <p className="mt-1 text-sm text-slate-400">Hỗ trợ JPG, PNG</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
