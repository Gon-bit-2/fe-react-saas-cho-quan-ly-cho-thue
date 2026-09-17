import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Zap,
  Droplet,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { useUtilityMetersControllerList, meterReadingsControllerCreate } from '../api'
import { useUploadOcr } from '@/shared/api/ocr'
import { ocrControllerGetById } from '@/shared/api/generated/ocr/ocr'
import { useProperties } from '@/shared/api/properties'
import type { Property } from '@/features/tenant-app/types'

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

/**
 * Trang Ghi chỉ số công tơ điện nước hỗ trợ nhận diện tự động từ ảnh chụp (OCR).
 * Cho phép chủ trọ chọn công tơ, tải ảnh chụp hoặc nhập tay, tự động đối soát với chỉ số cũ.
 */
export function MeterReadingUploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL')

  const [ocrJobId, setOcrJobId] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [ocrStatus, setOcrStatus] = useState<string | null>(null)

  const { mutateAsync: uploadOcr, isPending: isUploading } = useUploadOcr()

  // Lấy danh sách khu trọ
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  // Lấy danh sách công tơ
  const { data: metersResponse, isLoading: isLoadingMeters } = useUtilityMetersControllerList({
    limit: 200,
    status: 'ACTIVE',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMeters = useMemo(() => (metersResponse as unknown as { data?: Array<any> })?.data || [], [metersResponse])

  // Lọc công tơ theo khu trọ
  const filteredMeters = useMemo(() => {
    if (propertyFilter === 'ALL') return allMeters
    return allMeters.filter((m) => m.room?.propertyId?.toString() === propertyFilter)
  }, [allMeters, propertyFilter])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingMonth: new Date().toISOString().substring(0, 7) + '-01',
    },
  })

  const selectedMeterId = useWatch({ control, name: 'meterId' })
  const currentValue = useWatch({ control, name: 'currentValue' })
  const selectedMeter = allMeters.find((m) => m.id === Number(selectedMeterId))

  // Lấy chỉ số kỳ trước (nếu có)
  const previousValue = selectedMeter?.readings?.[0]?.currentValue ?? selectedMeter?.initialValue ?? 0
  const isElectricity = selectedMeter?.type === 'ELECTRICITY'
  const unitLabel = selectedMeter?.unit || (isElectricity ? 'kWh' : 'm³')

  // Tính toán mức tiêu thụ tạm tính
  const calculatedConsumption = useMemo(() => {
    if (currentValue === undefined || currentValue === null || isNaN(Number(currentValue))) return null
    return Number(currentValue) - Number(previousValue)
  }, [currentValue, previousValue])

  const isAbnormal = calculatedConsumption !== null && calculatedConsumption < 0

  const { mutate: createReading, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: Parameters<typeof meterReadingsControllerCreate>[0]) => {
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
    createReading({
      meterId: data.meterId,
      billingMonth: new Date(data.billingMonth).toISOString(),
      currentValue: data.currentValue,
      status: isAbnormal ? 'ABNORMAL' : 'DRAFT',
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

    const url = URL.createObjectURL(file)
    setPreviewImage(url)
    setOcrStatus('UPLOADING')

    try {
      const data = (await uploadOcr({ meterId: Number(selectedMeterId), file })) as unknown as OcrJobData
      setOcrJobId(data.id)
      setIsPolling(true)
      setOcrStatus('PROCESSING')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setOcrStatus('FAILED')
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
          setOcrStatus(data.status)
          clearInterval(interval)
          if (data.recognizedValue !== null && data.recognizedValue !== undefined) {
            setValue('currentValue', data.recognizedValue, { shouldValidate: true })
            if (data.status === 'SUCCESS') {
              toast.success(`Đã nhận diện thành công: ${data.recognizedValue}`)
            } else {
              toast.warning('AI đọc được số nhưng độ tin cậy thấp. Vui lòng đối soát lại.')
            }
          } else {
            toast.error('AI không đọc được số, vui lòng tự nhập tay.')
          }
        } else if (data.status === 'FAILED') {
          setIsPolling(false)
          setOcrStatus('FAILED')
          clearInterval(interval)
          toast.error('AI không thể đọc được ảnh này. Vui lòng nhập tay.')
        }
      } catch {
        setIsPolling(false)
        setOcrStatus('FAILED')
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [ocrJobId, isPolling, setValue])

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs"
          onClick={() => navigate('/dien-nuoc/chi-so')}
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dien-nuoc/chi-so" className="hover:text-blue-600">Chỉ số</Link>
            <span>/</span>
            <span className="font-medium text-slate-900">Ghi chỉ số mới</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ghi Chỉ Số & Nhận Diện Ảnh (OCR)
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Input Column */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="rounded-xl border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Thông tin ghi nhận chỉ số
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Chọn công tơ của phòng cần chốt số và điền chỉ số đọc được
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* Kỳ chốt chỉ số */}
              <div className="space-y-1.5">
                <Label htmlFor="billingMonth" className="text-xs font-semibold text-slate-700">
                  Kỳ tính phí *
                </Label>
                <Input
                  id="billingMonth"
                  type="month"
                  className="h-9 text-sm"
                  defaultValue={new Date().toISOString().substring(0, 7)}
                  onChange={(e) => {
                    setValue('billingMonth', e.target.value ? `${e.target.value}-01` : '')
                  }}
                />
                {errors.billingMonth && (
                  <p className="text-xs text-rose-500">{errors.billingMonth.message}</p>
                )}
              </div>

              {/* Lọc khu trọ & chọn công tơ */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Khu trọ</Label>
                  <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                    <SelectTrigger className="h-9 bg-slate-50 text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <SelectValue placeholder="Tất cả khu trọ" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL" className="text-xs">Tất cả khu trọ</SelectItem>
                      {properties.map((p: Property) => (
                        <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="meterId" className="text-xs font-semibold text-slate-700">
                    Chọn công tơ *
                  </Label>
                  <Select onValueChange={(val) => setValue('meterId', Number(val))}>
                    <SelectTrigger className="h-9 bg-slate-50 text-xs">
                      <SelectValue placeholder={isLoadingMeters ? 'Đang tải...' : 'Chọn công tơ'} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMeters.map((meter) => (
                        <SelectItem key={meter.id} value={meter.id.toString()} className="text-xs">
                          {meter.type === 'ELECTRICITY' ? '⚡ ' : '💧 '}
                          Phòng {meter.room?.roomCode || 'Chưa gán'} ({meter.meterCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.meterId && <p className="text-xs text-rose-500">{errors.meterId.message}</p>}
                </div>
              </div>

              {/* Thẻ tóm tắt công tơ đã chọn */}
              {selectedMeter && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isElectricity ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isElectricity ? <Zap className="h-4 w-4" /> : <Droplet className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {selectedMeter.meterCode}
                        </div>
                        <div className="text-xs text-slate-500">
                          Phòng {selectedMeter.room?.roomCode} • {isElectricity ? 'Điện năng' : 'Nước sinh hoạt'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Chỉ số cũ:</span>
                      <div className="font-mono text-sm font-bold tabular-nums text-slate-900">
                        {previousValue.toLocaleString('vi-VN')} {unitLabel}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nhập chỉ số mới */}
              <div className="space-y-1.5">
                <Label htmlFor="currentValue" className="text-xs font-semibold text-slate-700">
                  Chỉ số mới ({unitLabel}) *
                </Label>
                <div className="relative">
                  <Input
                    id="currentValue"
                    type="number"
                    step="any"
                    placeholder="Nhập số trên đồng hồ đo..."
                    className={`h-11 font-mono text-lg font-bold tabular-nums ${
                      isAbnormal ? 'border-rose-500 focus-visible:ring-rose-500' : ''
                    }`}
                    {...register('currentValue')}
                  />
                  {ocrStatus === 'SUCCESS' && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      <Sparkles className="h-3.5 w-3.5" /> AI điền tự động
                    </div>
                  )}
                </div>
                {errors.currentValue && (
                  <p className="text-xs text-rose-500">{errors.currentValue.message}</p>
                )}
              </div>

              {/* Cảnh báo tính toán tiêu thụ */}
              {calculatedConsumption !== null && !isNaN(calculatedConsumption) && (
                <div className={`rounded-xl border p-4 transition-all ${
                  isAbnormal
                    ? 'border-rose-200 bg-rose-50/50 text-rose-700'
                    : 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {isAbnormal ? (
                      <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    )}
                    <div>
                      <div className="text-sm font-semibold">
                        {isAbnormal ? 'Cảnh báo chỉ số bất thường' : 'Mức tiêu thụ hợp lệ'}
                      </div>
                      <div className="mt-0.5 text-xs">
                        Tiêu thụ: <strong className="font-mono tabular-nums">{calculatedConsumption.toLocaleString('vi-VN')} {unitLabel}</strong>{' '}
                        (= {currentValue} - {previousValue})
                        {isAbnormal && ' — Số mới nhỏ hơn số cũ, vui lòng kiểm tra lại đồng hồ.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedMeterId}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Đang lưu chỉ số...' : 'Lưu chỉ số điện nước'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OCR Camera / Upload Column */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="rounded-xl border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-1.5 text-base font-bold text-slate-900">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Trợ lý nhận diện ảnh (AI OCR)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Chụp hoặc tải ảnh mặt đồng hồ để tự động bóc tách số
                  </CardDescription>
                </div>
                {isPolling && (
                  <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 text-xs gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang nhận diện...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {previewImage ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                  <img
                    src={previewImage}
                    alt="Công tơ"
                    className="h-64 w-full object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white flex items-center justify-between">
                    <span className="text-xs">Ảnh đồng hồ đã chọn</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Đổi ảnh khác
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/30"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200 text-slate-500">
                    <ImagePlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-slate-900">
                    Tải lên ảnh chụp mặt công tơ
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Hỗ trợ định dạng JPG, PNG hoặc chụp trực tiếp từ camera điện thoại
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4 h-8 gap-1.5 text-xs"
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    {isUploading ? 'Đang tải...' : 'Chọn ảnh công tơ'}
                  </Button>
                </div>
              )}

              {/* Gợi ý chụp ảnh chuẩn */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-600" /> Mẹo chụp ảnh rõ số:
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Chụp thẳng góc, đủ ánh sáng và lau sạch mặt kính đồng hồ.</li>
                  <li>Lấy rõ cả dãy số nguyên màu đen (hoặc đỏ).</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
