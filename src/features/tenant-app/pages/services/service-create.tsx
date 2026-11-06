import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useCreateService } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Save, Sparkles, Check } from 'lucide-react'
import { ServiceType, type Service } from '@/types/service'
import { toast } from 'sonner'

type ServiceFormData = Pick<Service, 'code' | 'name' | 'defaultUnitPrice' | 'unitLabel' | 'itemType' | 'isActive'>

// Danh sách dịch vụ phổ biến để chọn nhanh
const SERVICE_TEMPLATES = [
  { name: 'Internet / Wifi tốc độ cao', code: 'WIFI', defaultUnitPrice: 100000, unitLabel: 'phòng' },
  { name: 'Phí thu gom rác & vệ sinh', code: 'RAC', defaultUnitPrice: 50000, unitLabel: 'phòng' },
  { name: 'Giữ xe máy hàng tháng', code: 'XEMAY', defaultUnitPrice: 120000, unitLabel: 'chiếc' },
  { name: 'Sử dụng thang máy', code: 'THANGMAY', defaultUnitPrice: 50000, unitLabel: 'người' },
  { name: 'Máy giặt chung & sấy', code: 'MAYGIAT', defaultUnitPrice: 60000, unitLabel: 'người' },
  { name: 'Bảo vệ & an ninh 24/7', code: 'BAOVE', defaultUnitPrice: 40000, unitLabel: 'phòng' },
]

/**
 * Trang tạo dịch vụ tiện ích mới cho khu trọ.
 * Hỗ trợ các mẫu dịch vụ thông dụng (Wifi, Rác, Gửi xe...) để chủ trọ áp dụng nhanh.
 */
export default function ServiceCreate() {
  const navigate = useNavigate()
  const { mutateAsync: createService, isPending } = useCreateService()

  const [formData, setFormData] = useState<ServiceFormData>({
    code: '',
    name: '',
    defaultUnitPrice: 50000,
    unitLabel: 'phòng',
    itemType: ServiceType.SERVICE,
    isActive: true,
  })

  const handleApplyTemplate = (tmpl: typeof SERVICE_TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      name: tmpl.name,
      code: tmpl.code,
      defaultUnitPrice: tmpl.defaultUnitPrice,
      unitLabel: tmpl.unitLabel,
    }))
    toast.info(`Đã áp dụng mẫu: ${tmpl.name}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createService(formData)
      toast.success('Tạo dịch vụ thành công')
      navigate('/dich-vu')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo dịch vụ')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs"
        >
          <Link to="/dich-vu">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dich-vu" className="hover:text-blue-600">Dịch vụ</Link>
            <span>/</span>
            <span className="font-medium text-slate-900">Thêm mới</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tạo Dịch Vụ Mới
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-5xl">
        {/* Form Column */}
        <div className="lg:col-span-8">
          <Card className="rounded-xl border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Thông tin dịch vụ & bảng giá
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Thiết lập tên, đơn vị đo và giá cước áp dụng khi lập hóa đơn cho khách thuê
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Tên dịch vụ *
                  </Label>
                  <Input
                    id="name"
                    placeholder="VD: Tiền rác, Internet Wifi..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                      Mã dịch vụ *
                    </Label>
                    <Input
                      id="code"
                      placeholder="VD: WIFI, RAC, XEMAY..."
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="h-9 font-mono text-sm uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="unitLabel" className="text-xs font-semibold text-slate-700">
                      Đơn vị tính *
                    </Label>
                    <Input
                      id="unitLabel"
                      placeholder="VD: phòng, người, chiếc, tháng..."
                      value={formData.unitLabel}
                      onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="defaultUnitPrice" className="text-xs font-semibold text-slate-700">
                    Đơn giá cơ sở (VNĐ) *
                  </Label>
                  <Input
                    id="defaultUnitPrice"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="VD: 100000"
                    value={formData.defaultUnitPrice || ''}
                    onChange={(e) => setFormData({ ...formData, defaultUnitPrice: Number(e.target.value) })}
                    className="h-10 font-mono text-base font-bold tabular-nums"
                    required
                  />
                  <p className="text-xs text-slate-400">
                    Giá mặc định mỗi {formData.unitLabel || 'đơn vị'} khi gán vào phòng trọ.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
                <Button variant="outline" type="button" onClick={() => navigate(-1)} className="h-9 text-xs">
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {isPending ? 'Đang lưu...' : 'Lưu dịch vụ'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Template Suggestions Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-xl border-slate-200 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Mẫu dịch vụ phổ biến
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Nhấn chọn để tự động điền nhanh
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {SERVICE_TEMPLATES.map((tmpl) => {
                const isSelected = formData.code === tmpl.code
                return (
                  <button
                    key={tmpl.code}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 font-medium text-blue-900 ring-1 ring-blue-500'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{tmpl.name}</div>
                      <div className="text-slate-500 mt-0.5 font-mono">
                        {tmpl.defaultUnitPrice.toLocaleString('vi-VN')} ₫ / {tmpl.unitLabel}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
