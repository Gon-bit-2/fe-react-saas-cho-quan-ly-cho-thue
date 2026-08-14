import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { 
  ArrowLeft, Users, FileText,
  Search, CreditCard, Upload, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRooms } from '@/shared/api/properties'
import { useRenters, useUploadRenterImages } from '@/shared/api/renters'
import { useCreateContract, useUpdateContract, useContract } from '@/shared/api/contracts'
import type { ContractBillingCycle, CreateContractBody, RenterInfo, UpdateContractBody } from '@/types/contract'

export default function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const renterIdParam = searchParams.get('renterId')
  const isEditing = !!id

  const { data: contractData, isLoading: isLoadingContract } = useContract(Number(id))
  const { mutateAsync: createContract, isPending: isCreating } = useCreateContract()
  const { mutateAsync: updateContract, isPending: isUpdating } = useUpdateContract(Number(id))
  const { mutateAsync: uploadRenterImages, isPending: isUploading } = useUploadRenterImages()
  
  const loading = isCreating || isUpdating || isUploading

  // Form State
  const [formData, setFormData] = useState({
    roomId: '',
    renterId: renterIdParam || '',
    startDate: '',
    endDate: '',
    monthlyPrice: '',
    depositAmount: '',
    billingCycle: 'MONTHLY' as ContractBillingCycle,
    paymentDueDay: '5',
    contentSnapshot: '',
  })

  // Thông tin pháp lý của người thuê
  const [renterInfo, setRenterInfo] = useState<RenterInfo>({
    phone: '',
    identityNumber: '',
    permanentAddress: '',
    identityFrontUrl: '',
    identityBackUrl: '',
    fullName: '',
    dateOfBirth: ''
  })

  // File ảnh CCCD chưa upload (preview local)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [frontPreview, setFrontPreview] = useState<string>('')
  const [backPreview, setBackPreview] = useState<string>('')
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const [renterSearch, setRenterSearch] = useState('')

  // Queries
  const { data: roomsData } = useRooms({ limit: 100 })
  
  const { data: rentersData } = useRenters({ search: renterSearch, limit: 10 })

  // Initialize form when editing
  /* eslint-disable react-hooks/set-state-in-effect -- API detail hydrates the edit form once it arrives. */
  useEffect(() => {
    if (isEditing && contractData) {
      setFormData({
        roomId: String(contractData.roomId),
        renterId: String(contractData.renterId),
        startDate: contractData.startDate ? contractData.startDate.substring(0, 10) : '',
        endDate: contractData.endDate ? contractData.endDate.substring(0, 10) : '',
        monthlyPrice: String(contractData.monthlyPrice || ''),
        depositAmount: String(contractData.depositAmount || ''),
        billingCycle: contractData.billingCycle || 'MONTHLY',
        paymentDueDay: String(contractData.paymentDueDay || '5'),
        contentSnapshot: contractData.contentSnapshot || '',
      })
      // Autofill renterInfo khi đang chỉnh sửa hợp đồng
      if (contractData.renter) {
        const profile = contractData.renter.renterProfile
        setRenterInfo({
          fullName: contractData.renter.fullName || '',
          dateOfBirth: contractData.renter.dateOfBirth ? contractData.renter.dateOfBirth.substring(0, 10) : '',
          phone: contractData.renter.phone || '',
          identityNumber: profile?.identityNumber || '',
          permanentAddress: profile?.permanentAddress || '',
          identityFrontUrl: profile?.identityFrontUrl || '',
          identityBackUrl: profile?.identityBackUrl || '',
        })
        setFrontPreview(profile?.identityFrontUrl || '')
        setBackPreview(profile?.identityBackUrl || '')
      }
    }
  }, [isEditing, contractData])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handle Room Selection: Auto-fill price and deposit
  const handleRoomSelect = (val: string) => {
    setFormData(prev => ({ ...prev, roomId: val }))
    const selectedRoom = roomsData?.data.find(r => String(r.id) === val)
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        monthlyPrice: String(selectedRoom.basePrice || ''),
        depositAmount: String(selectedRoom.depositAmount || selectedRoom.basePrice || '')
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRenterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRenterInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (side: 'front' | 'back', file: File | null) => {
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    if (side === 'front') {
      setFrontFile(file)
      setFrontPreview(previewUrl)
    } else {
      setBackFile(file)
      setBackPreview(previewUrl)
    }
  }

  const handleRemoveFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontFile(null)
      setFrontPreview('')
      setRenterInfo(prev => ({ ...prev, identityFrontUrl: '' }))
      if (frontInputRef.current) frontInputRef.current.value = ''
    } else {
      setBackFile(null)
      setBackPreview('')
      setRenterInfo(prev => ({ ...prev, identityBackUrl: '' }))
      if (backInputRef.current) backInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.roomId || !formData.renterId) {
      alert('Vui lòng chọn phòng và khách thuê đã có trong hệ thống.')
      return
    }

    try {
      // Upload ảnh CCCD nếu có file mới được chọn
      const finalRenterInfo: RenterInfo = {
        phone: renterInfo.phone,
        identityNumber: renterInfo.identityNumber,
        permanentAddress: renterInfo.permanentAddress,
        identityFrontUrl: renterInfo.identityFrontUrl,
        identityBackUrl: renterInfo.identityBackUrl,
      }
      const filesToUpload: File[] = []
      if (frontFile) filesToUpload.push(frontFile)
      if (backFile) filesToUpload.push(backFile)

      if (filesToUpload.length > 0 && formData.renterId) {
        const uploadResults = await uploadRenterImages({
          renterId: Number(formData.renterId),
          files: filesToUpload,
        })
        let idx = 0
        if (frontFile && uploadResults[idx]) {
          finalRenterInfo.identityFrontUrl = uploadResults[idx].url
          idx++
        }
        if (backFile && uploadResults[idx]) {
          finalRenterInfo.identityBackUrl = uploadResults[idx].url
        }
      }

      const updatePayload: UpdateContractBody = {
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        monthlyPrice: Number(formData.monthlyPrice),
        depositAmount: Number(formData.depositAmount),
        billingCycle: formData.billingCycle,
        paymentDueDay: Number(formData.paymentDueDay),
        contentSnapshot: formData.contentSnapshot.trim() || 'Hợp đồng tiêu chuẩn',
        renterInfo: finalRenterInfo,
      }
      
      if (isEditing) {
        await updateContract(updatePayload)
      } else {
        const createPayload: CreateContractBody = {
          ...updatePayload,
          roomId: Number(formData.roomId),
          renterId: Number(formData.renterId),
          startDate: updatePayload.startDate!,
          endDate: updatePayload.endDate!,
          monthlyPrice: updatePayload.monthlyPrice!,
          depositAmount: updatePayload.depositAmount!,
          billingCycle: updatePayload.billingCycle!,
          paymentDueDay: updatePayload.paymentDueDay!,
          contentSnapshot: updatePayload.contentSnapshot!,
        }
        await createContract(createPayload)
      }
      navigate('/hop-dong')
    } catch (error) {
      console.error('Failed to submit contract', error)
      alert('Có lỗi xảy ra khi lưu hợp đồng.')
    }
  }

  if (isEditing && isLoadingContract) {
    return <div className="p-12 text-center text-slate-500">Đang tải dữ liệu hợp đồng...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/hop-dong')} className="-ml-2 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {isEditing ? 'Chỉnh sửa hợp đồng nháp' : 'Tạo hợp đồng mới'}
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 uppercase text-[10px] tracking-wider font-bold">
                Trạng thái: Nháp
              </Badge>
            </h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/hop-dong')} className="bg-white">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật thay đổi' : 'Tạo hợp đồng'}
          </Button>
        </div>
      </div>

      {/* THÔNG TIN CƠ BẢN */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> THÔNG TIN CƠ BẢN
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Mã hợp đồng</Label>
              <Input value={isEditing ? `HD-${id}` : 'Tạo tự động'} disabled className="bg-slate-50 text-slate-500 font-medium border-slate-200" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Phòng cho thuê <span className="text-red-500">*</span></Label>
              <Select value={formData.roomId} onValueChange={handleRoomSelect} disabled={isEditing}>
                <SelectTrigger className="border-slate-200 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {roomsData?.data.map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.title || r.roomCode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Ngày bắt đầu <span className="text-red-500">*</span></Label>
              <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="border-slate-200 focus:ring-blue-500" required />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Thời hạn (Tháng)</Label>
              <Select defaultValue="12">
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="Thời hạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Tháng</SelectItem>
                  <SelectItem value="12">12 Tháng</SelectItem>
                  <SelectItem value="24">24 Tháng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Ngày kết thúc dự kiến <span className="text-red-500">*</span></Label>
              <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="border-slate-200 focus:ring-blue-500 bg-emerald-50 text-emerald-700 font-medium border-emerald-200" required />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KHÁCH THUÊ CHÍNH */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> KHÁCH THUÊ CHÍNH
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search Khách cũ */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Label className="text-blue-800 font-medium">Chọn khách thuê đã có trong hệ thống</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input 
                placeholder="Tìm bằng SĐT hoặc Tên..." 
                className="pl-9 bg-white border-blue-200 focus:ring-blue-500"
                value={renterSearch}
                onChange={(e) => setRenterSearch(e.target.value)}
                disabled={isEditing}
              />
            </div>
            {/* Search Results Dropdown */}
            {renterSearch && rentersData?.data && rentersData.data.length > 0 && !formData.renterId && (
              <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                {rentersData.data.map(renter => (
                  <div 
                    key={renter.id} 
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-50"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, renterId: String(renter.id) }))
                      setRenterSearch('')
                      setRenterInfo({
                        fullName: renter.fullName || '',
                        dateOfBirth: renter.dateOfBirth ? renter.dateOfBirth.substring(0, 10) : '',
                        phone: renter.phone || '',
                        identityNumber: renter.identityNumber || '',
                        permanentAddress: renter.permanentAddress || '',
                        identityFrontUrl: renter.identityFrontUrl || '',
                        identityBackUrl: renter.identityBackUrl || '',
                      })
                      setFrontPreview(renter.identityFrontUrl || '')
                      setBackPreview(renter.identityBackUrl || '')
                    }}
                  >
                    <div className="font-semibold text-slate-900">{renter.fullName}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{renter.phone} - CCCD: {renter.identityNumber}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Họ và tên <span className="text-red-500">*</span></Label>
              <Input name="fullName" value={renterInfo.fullName ?? ''} disabled className="border-slate-200 bg-slate-50" placeholder="Chọn khách thuê ở trên" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Số điện thoại <span className="text-red-500">*</span></Label>
              <Input name="phone" value={renterInfo.phone ?? ''} onChange={handleRenterChange} className="border-slate-200 focus:ring-blue-500" placeholder="0901234567" required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">CCCD/CMND <span className="text-red-500">*</span></Label>
              <Input name="identityNumber" value={renterInfo.identityNumber ?? ''} onChange={handleRenterChange} className="border-slate-200 focus:ring-blue-500" placeholder="079..." required />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Ngày sinh</Label>
              <Input type="date" name="dateOfBirth" value={renterInfo.dateOfBirth ?? ''} disabled className="border-slate-200 bg-slate-50" />
            </div>
          </div>

          {/* Upload CCCD */}
          <div className="space-y-3 pt-2">
            <Label className="text-slate-600 text-xs font-bold uppercase">Hình ảnh giấy tờ</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Mặt trước</p>
                {frontPreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={frontPreview} alt="Mặt trước" className="w-full h-32 object-cover" />
                    <button type="button" onClick={() => handleRemoveFile('front')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 bg-slate-50 transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-600">Tải ảnh mặt trước</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect('front', e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">Mặt sau</p>
                {backPreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={backPreview} alt="Mặt sau" className="w-full h-32 object-cover" />
                    <button type="button" onClick={() => handleRemoveFile('back')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 bg-slate-50 transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-600">Tải ảnh mặt sau</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect('back', e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TÀI CHÍNH */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> TÀI CHÍNH
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label className="text-slate-600 text-xs font-bold uppercase">Giá thuê / tháng <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type="number" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleChange} className="border-slate-200 focus:ring-blue-500 pr-14 text-right font-bold text-lg" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">VNĐ</span>
              </div>
            </div>
            
            <div className="space-y-2 relative">
              <Label className="text-slate-600 text-xs font-bold uppercase">Tiền cọc <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="border-slate-200 focus:ring-blue-500 pr-14 text-right font-bold text-lg" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">VNĐ</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Chu kỳ thanh toán</Label>
              <Select value={formData.billingCycle} onValueChange={(val) => setFormData(prev => ({...prev, billingCycle: val as ContractBillingCycle}))}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="Chọn chu kỳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">1 Tháng / Lần</SelectItem>
                  <SelectItem value="QUARTERLY">3 Tháng / Lần</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 text-xs font-bold uppercase">Ngày thanh toán hàng tháng</Label>
              <Select value={formData.paymentDueDay} onValueChange={(val) => setFormData(prev => ({...prev, paymentDueDay: val}))}>
                <SelectTrigger className="border-slate-200 bg-white">
                  <SelectValue placeholder="Chọn ngày" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>Ngày {day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ĐIỀU KHOẢN BỔ SUNG */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> GHI CHÚ / ĐIỀU KHOẢN BỔ SUNG
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea 
            placeholder="Nhập ghi chú hoặc điều khoản riêng tư cho hợp đồng này..."
            name="contentSnapshot"
            value={formData.contentSnapshot}
            onChange={handleChange}
            className="min-h-[150px] border-slate-200 focus:ring-blue-500 resize-none rounded-xl"
          />
        </CardContent>
      </Card>
    </form>
  )
}
