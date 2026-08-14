import { useState } from 'react'
import { Plus, Settings, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useServices, useServiceAssignments, useAssignService, useUpdateServiceAssignment } from '@/shared/api/services'
import { useAuth } from '@/shared/hooks/use-auth'

export function RoomServices({ roomId }: { roomId: number }) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('1')

  const { data: assignmentsData, isLoading: isLoadingAssignments } = useServiceAssignments({
    roomId,
    isActive: true,
  })

  const { data: catalogData, isLoading: isLoadingCatalog } = useServices({
    isActive: true,
    limit: 100,
  })

  const assignService = useAssignService()
  const updateAssignment = useUpdateServiceAssignment()

  const assignments = assignmentsData?.data || []
  const catalog = catalogData?.data || []

  // Lọc ra các dịch vụ chưa được gán
  const unassignedServices = catalog.filter((s) => !assignments.some((a) => a.serviceId === s.id))

  const handleAssign = () => {
    if (!selectedServiceId) {
      toast.error('Vui lòng chọn dịch vụ')
      return
    }

    assignService.mutate(
      {
        serviceId: Number(selectedServiceId),
        roomId,
        quantity: Number(quantity) || 1,
      },
      {
        onSuccess: () => {
          toast.success('Đã gán dịch vụ thành công')
          setIsOpen(false)
          setSelectedServiceId('')
          setQuantity('1')
          queryClient.invalidateQueries({ queryKey: ['service-assignments', tenantId] })
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi gán dịch vụ')
        },
      },
    )
  }

  const handleRemove = (assignmentId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn bỏ gán dịch vụ này?')) {
      updateAssignment.mutate(
        { id: assignmentId, payload: { isActive: false } },
        {
          onSuccess: () => {
            toast.success('Đã gỡ dịch vụ thành công')
            queryClient.invalidateQueries({ queryKey: ['service-assignments', tenantId] })
          },
          onError: () => {
            toast.error('Có lỗi xảy ra khi gỡ dịch vụ')
          },
        },
      )
    }
  }

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <CardTitle className="text-lg text-slate-800">Dịch vụ đang dùng</CardTitle>
          <CardDescription>Các dịch vụ đang được tính phí cho phòng này</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Thêm dịch vụ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm dịch vụ cho phòng</DialogTitle>
              <DialogDescription>Chọn dịch vụ từ danh mục để gán cho phòng này.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="service">Dịch vụ</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Chọn dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCatalog ? (
                      <div className="p-2 text-center text-sm text-slate-500">Đang tải...</div>
                    ) : unassignedServices.length === 0 ? (
                      <div className="p-2 text-center text-sm text-slate-500">Không còn dịch vụ nào để thêm</div>
                    ) : (
                      unassignedServices.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name} ({new Intl.NumberFormat('vi-VN').format(service.defaultUnitPrice)}đ/
                          {service.unitLabel})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Số lượng (mặc định)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAssign} disabled={assignService.isPending}>
                {assignService.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingAssignments ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Đang tải dữ liệu...
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {assignment.service?.name || 'Dịch vụ không xác định'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Intl.NumberFormat('vi-VN').format(assignment.service?.defaultUnitPrice || 0)}đ /{' '}
                      {assignment.service?.unitLabel || 'tháng'} (SL: {assignment.quantity})
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleRemove(assignment.id)}
                  disabled={updateAssignment.isPending}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Settings className="mb-3 h-12 w-12 text-slate-300" />
            <p className="font-medium text-slate-600">Chưa có dịch vụ nào được gán</p>
            <p className="text-sm">Bấm "Thêm dịch vụ" để gán dịch vụ cho phòng này.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
