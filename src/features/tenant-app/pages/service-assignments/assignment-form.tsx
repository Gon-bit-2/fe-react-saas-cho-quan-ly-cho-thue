import { useNavigate, Link } from 'react-router'
import { useState, useMemo } from 'react'
import { useAssignService, useServices } from '@/shared/api/services'
import { useRoomsControllerList } from '@/shared/api/generated/rooms/rooms'
import { useProperties } from '@/shared/api/properties'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Save, Building2, DoorOpen, Wrench } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/utils'
import { toast } from 'sonner'
import type { Property } from '@/features/tenant-app/types'

/**
 * Trang gán dịch vụ tiện ích cho phòng trọ cụ thể.
 * Cho phép chủ trọ chọn khu trọ, chọn phòng, chọn dịch vụ từ danh sách và nhập số lượng.
 */
export default function AssignmentForm() {
  const navigate = useNavigate()
  const { mutateAsync: assignService, isPending } = useAssignService()

  // Lấy danh sách dịch vụ
  const { data: servicesData, isLoading: isLoadingServices } = useServices()
  const services = servicesData?.data || []

  // Lấy danh sách khu trọ
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  // Lấy danh sách phòng
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRoomsControllerList({ limit: 200 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRooms = useMemo(() => (roomsResponse as unknown as { data?: Array<any> })?.data || [], [roomsResponse])

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL')
  const [formData, setFormData] = useState({
    serviceId: 0,
    roomId: 0,
    quantity: 1,
  })

  // Lọc phòng theo khu trọ đã chọn
  const filteredRooms = useMemo(() => {
    if (selectedPropertyId === 'ALL') return allRooms
    return allRooms.filter((r) => r.propertyId?.toString() === selectedPropertyId)
  }, [allRooms, selectedPropertyId])

  // Dịch vụ đang chọn
  const selectedService = services.find((s) => s.id === formData.serviceId)

  // Thành tiền tạm tính
  const estimatedTotal = (selectedService?.defaultUnitPrice || 0) * (formData.quantity || 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.serviceId) {
      toast.error('Vui lòng chọn dịch vụ')
      return
    }
    if (!formData.roomId) {
      toast.error('Vui lòng chọn phòng')
      return
    }

    try {
      await assignService(formData)
      toast.success('Gán dịch vụ cho phòng thành công')
      navigate('/dich-vu-da-gan')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gán dịch vụ')
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
          <Link to="/dich-vu-da-gan">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/dich-vu-da-gan" className="hover:text-blue-600">Dịch vụ đã gán</Link>
            <span>/</span>
            <span className="font-medium text-slate-900">Gán mới</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gán Dịch Vụ Tiện Ích Cho Phòng
          </h1>
        </div>
      </div>

      <Card className="max-w-2xl rounded-xl border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Thông tin phân bổ dịch vụ
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Chọn dịch vụ và phòng áp dụng để tự động tính vào hóa đơn hàng tháng
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            {/* Lựa chọn Dịch vụ */}
            <div className="space-y-1.5">
              <Label htmlFor="serviceId" className="text-xs font-semibold text-slate-700">
                Chọn dịch vụ tiện ích *
              </Label>
              <Select
                value={formData.serviceId ? formData.serviceId.toString() : ''}
                onValueChange={(val) => setFormData({ ...formData, serviceId: Number(val) })}
              >
                <SelectTrigger className="h-9 bg-slate-50 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <Wrench className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <SelectValue placeholder={isLoadingServices ? 'Đang tải...' : 'Chọn dịch vụ'} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {services.map((srv) => (
                    <SelectItem key={srv.id} value={srv.id.toString()} className="text-xs">
                      {srv.name} — {formatCurrency(srv.defaultUnitPrice)} / {srv.unitLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chọn Khu trọ & Phòng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Khu trọ</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
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
                <Label htmlFor="roomId" className="text-xs font-semibold text-slate-700">
                  Gán cho phòng *
                </Label>
                <Select
                  value={formData.roomId ? formData.roomId.toString() : ''}
                  onValueChange={(val) => setFormData({ ...formData, roomId: Number(val) })}
                >
                  <SelectTrigger className="h-9 bg-slate-50 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <DoorOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <SelectValue placeholder={isLoadingRooms ? 'Đang tải...' : 'Chọn phòng'} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()} className="text-xs">
                        Phòng {room.roomCode} {room.title ? `(${room.title})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Số lượng */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-xs font-semibold text-slate-700">
                Số lượng áp dụng *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                className="h-9 font-mono text-sm tabular-nums"
                required
              />
              <p className="text-xs text-slate-400">
                Ví dụ: 2 chiếc xe máy, 1 gói internet...
              </p>
            </div>

            {/* Thẻ xem trước thành tiền */}
            {selectedService && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Đơn giá:</span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">
                    {formatCurrency(selectedService.defaultUnitPrice)} / {selectedService.unitLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-blue-100/80 pt-2">
                  <span className="text-xs font-bold text-slate-900">Cước dự kiến hàng tháng:</span>
                  <span className="font-mono text-base font-bold tabular-nums text-blue-600">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/50 p-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)} className="h-9 text-xs">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !formData.serviceId || !formData.roomId}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isPending ? 'Đang gán...' : 'Gán dịch vụ'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
