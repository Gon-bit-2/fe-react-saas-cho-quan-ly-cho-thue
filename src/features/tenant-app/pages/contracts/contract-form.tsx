import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContractBillingCycle } from '@/types/contract'

export default function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [loading, setLoading] = useState(false)

  // Dữ liệu mẫu (chỉ để demo)
  const [formData, setFormData] = useState({
    roomId: '',
    renterId: '',
    startDate: '',
    endDate: '',
    monthlyPrice: '',
    depositAmount: '',
    billingCycle: 'MONTHLY' as ContractBillingCycle,
    paymentDueDay: '5',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Giả lập gọi API tạo/sửa hợp đồng
    setTimeout(() => {
      setLoading(false)
      navigate('/hop-dong')
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link to="/hop-dong">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {isEditing ? 'Chỉnh sửa hợp đồng nháp' : 'Tạo hợp đồng mới'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Điền các thông tin cần thiết để tạo bản ghi hợp đồng thuê phòng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin phòng & người thuê */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomId">Phòng thuê <span className="text-red-500">*</span></Label>
                <Select value={formData.roomId} onValueChange={(val) => handleSelectChange('roomId', val)}>
                  <SelectTrigger id="roomId">
                    <SelectValue placeholder="Chọn phòng..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="201">Phòng 201 (Tầng 2)</SelectItem>
                    <SelectItem value="202">Phòng 202 (Tầng 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="renterId">Người đại diện thuê <span className="text-red-500">*</span></Label>
                <Select value={formData.renterId} onValueChange={(val) => handleSelectChange('renterId', val)}>
                  <SelectTrigger id="renterId">
                    <SelectValue placeholder="Chọn người thuê..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="101">Nguyễn Văn A</SelectItem>
                    <SelectItem value="102">Trần Thị B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Thời hạn hợp đồng */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thời hạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu <span className="text-red-500">*</span></Label>
                <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc <span className="text-red-500">*</span></Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          {/* Tài chính */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tài chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Giá thuê hàng tháng (VND) <span className="text-red-500">*</span></Label>
                <Input id="monthlyPrice" name="monthlyPrice" type="number" placeholder="5000000" value={formData.monthlyPrice} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Tiền cọc (VND) <span className="text-red-500">*</span></Label>
                <Input id="depositAmount" name="depositAmount" type="number" placeholder="5000000" value={formData.depositAmount} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Chu kỳ thanh toán</Label>
                  <Select value={formData.billingCycle} onValueChange={(val) => handleSelectChange('billingCycle', val)}>
                    <SelectTrigger id="billingCycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                      <SelectItem value="QUARTERLY">Hàng quý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDueDay">Ngày đến hạn</Label>
                  <Input id="paymentDueDay" name="paymentDueDay" type="number" min="1" max="28" value={formData.paymentDueDay} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link to="/hop-dong">Hủy bỏ</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Lưu thay đổi' : 'Tạo hợp đồng nháp'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
