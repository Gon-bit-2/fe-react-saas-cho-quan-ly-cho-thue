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

const formSchema = z.object({
  meterId: z.coerce.number().int().positive('Vui lòng chọn công tơ'),
  billingMonth: z.string().nonempty('Vui lòng chọn tháng ghi chỉ số'),
  currentValue: z.coerce.number().nonnegative('Chỉ số mới không hợp lệ'),
})

type FormInput = z.input<typeof formSchema>
type FormValues = z.output<typeof formSchema>

export function MeterReadingUploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    let imageUrl = undefined
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-in fade-in duration-500 p-8">
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

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-6">
              <CardTitle className="text-xl text-slate-800">Thông tin ghi chỉ số</CardTitle>
              <CardDescription>Chọn công tơ và nhập số điện/nước sử dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-white p-6">
              <div className="space-y-2.5">
                <Label htmlFor="billingMonth" className="font-medium text-slate-700">Kỳ ghi chỉ số <span className="text-red-500">*</span></Label>
                <Input
                  id="billingMonth"
                  type="month"
                  className="border-slate-200 bg-slate-50"
                  defaultValue={new Date().toISOString().substring(0, 7)}
                  onChange={(e) => {
                    setValue('billingMonth', e.target.value ? `${e.target.value}-01` : '')
                  }}
                />
                {errors.billingMonth && <p className="text-sm font-medium text-red-500">{errors.billingMonth.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="meterId" className="font-medium text-slate-700">Công Tơ <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue('meterId', Number(val))}>
                  <SelectTrigger className={`border-slate-200 bg-slate-50 ${errors.meterId ? 'border-red-500 ring-red-500' : ''}`}>
                    <SelectValue placeholder={isLoadingMeters ? 'Đang tải...' : 'Chọn công tơ'} />
                  </SelectTrigger>
                  <SelectContent>
                    {meters.map((meter) => (
                      <SelectItem key={meter.id} value={meter.id.toString()}>
                        {meter.meterCode} - Phòng {meter.room?.roomCode} ({meter.type === 'ELECTRICITY' ? 'Điện' : 'Nước'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.meterId && <p className="text-sm font-medium text-red-500">{errors.meterId.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="currentValue" className="font-medium text-slate-700">
                  Chỉ số mới {selectedMeter?.unit ? `(${selectedMeter.unit})` : ''} <span className="text-red-500">*</span>
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
                {errors.currentValue && <p className="text-sm font-medium text-red-500">{errors.currentValue.message}</p>}
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
            <Button type="submit" size="lg" className="px-8 shadow-md" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Lưu Chỉ Số
            </Button>
          </div>
        </div>

        {/* Image Upload Column */}
        <div className="space-y-6 h-[500px]">
          <Card className="h-full overflow-hidden rounded-xl border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="border-b border-slate-200/60 bg-slate-50/80 pb-4 shrink-0">
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
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
            <CardContent className="flex-1 p-0 bg-slate-100 flex items-center justify-center relative group min-h-0">
              {previewImage ? (
                <div className="absolute inset-0 p-4">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-contain rounded-lg shadow-sm bg-white"
                  />
                  <div 
                    className="absolute inset-4 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white font-medium flex items-center gap-2">
                      <ImagePlus className="w-5 h-5" /> Tải ảnh khác
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200/50 transition-colors m-4 rounded-lg border-2 border-dashed border-slate-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="font-medium text-slate-500">Nhấp để chọn ảnh công tơ</p>
                  <p className="text-sm mt-1 text-slate-400">Hỗ trợ JPG, PNG</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
