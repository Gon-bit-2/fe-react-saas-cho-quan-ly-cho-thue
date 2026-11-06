import { useParams, useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useService, useUpdateService } from '@/shared/api/services'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import type { Service } from '@/types/service'
import { toast } from 'sonner'

/**
 * Trang chỉnh sửa thông tin bảng giá và cấu hình dịch vụ tiện ích.
 */
export default function ServiceEdit() {
  const { id } = useParams()
  const { data: service, isLoading } = useService(Number(id))

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-80 max-w-2xl rounded-xl" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy thông tin dịch vụ này.
      </div>
    )
  }

  return <ServiceEditForm service={service} />
}

function ServiceEditForm({ service }: { service: Service }) {
  const navigate = useNavigate()
  const { mutateAsync: updateService, isPending } = useUpdateService(service.id)

  const [formData, setFormData] = useState({
    code: service.code,
    name: service.name,
    defaultUnitPrice: service.defaultUnitPrice,
    unitLabel: service.unitLabel,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateService(formData)
      toast.success('Cập nhật dịch vụ thành công')
      navigate('/dich-vu')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dịch vụ')
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
            <span className="font-medium text-slate-900">Chỉnh sửa</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Chỉnh Sửa Dịch Vụ: {service.name}
          </h1>
        </div>
      </div>

      <Card className="max-w-2xl rounded-xl border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Thông tin cấu hình
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Thay đổi đơn giá cơ sở hoặc đơn vị tính cước dịch vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Tên dịch vụ *
              </Label>
              <Input
                id="name"
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
                value={formData.defaultUnitPrice}
                onChange={(e) => setFormData({ ...formData, defaultUnitPrice: Number(e.target.value) })}
                className="h-10 font-mono text-base font-bold tabular-nums"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)} className="h-9 text-xs">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isPending ? 'Đang lưu...' : 'Cập nhật dịch vụ'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
