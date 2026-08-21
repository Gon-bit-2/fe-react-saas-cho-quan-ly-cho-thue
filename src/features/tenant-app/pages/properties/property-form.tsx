import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useProperty, useCreateProperty, useUpdateProperty, useUploadPropertyCoverImage, useUploadPropertyVerification } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Building2, DoorOpen, ImageIcon, Save, Trash2, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CreatePropertyDto } from '@/features/tenant-app/types'
import { AddressPicker, type AddressSelection } from '@/shared/components/address-picker'
import { useAuth } from '@/shared/hooks/use-auth'

export function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { selectedMembership } = useAuth()
  const verificationStatus = selectedMembership?.tenant?.verificationStatus || 'UNVERIFIED'
  const needsVerification = verificationStatus === 'UNVERIFIED'

  const { data: initialData, isLoading } = useProperty(Number(id))
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty(Number(id))
  const uploadCoverImage = useUploadPropertyCoverImage(Number(id))
  const uploadVerification = useUploadPropertyVerification()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const docsRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const totalSteps = needsVerification ? 3 : 2

  const [propertyTypeState, setPropertyType] = useState<string | null>(null)
  const [statusState, setStatus] = useState<string | null>(null)
  const [addressSelection, setAddressSelection] = useState<AddressSelection | null>(null)

  // Verification files
  const [idCardFront, setIdCardFront] = useState<File | null>(null)
  const [idCardBack, setIdCardBack] = useState<File | null>(null)
  const [verificationDocs, setVerificationDocs] = useState<File[]>([])

  const propertyType = (propertyTypeState ?? initialData?.type ?? 'MINI_APARTMENT') as CreatePropertyDto['type']
  const status = (statusState ?? initialData?.status ?? 'ACTIVE') as NonNullable<CreatePropertyDto['status']>

  const handleNext = () => {
    if (step === 1) {
      const nameInput = document.getElementById('name') as HTMLInputElement
      if (!nameInput?.value) {
        toast.error('Vui lòng nhập tên khu trọ')
        return
      }
      if (!addressSelection && (!isEditing || !initialData?.provinceCode)) {
        toast.error('Vui lòng chọn một địa chỉ chuẩn từ danh sách gợi ý.')
        return
      }
    }
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (step < totalSteps) {
      handleNext()
      return
    }

    if (!addressSelection && (!isEditing || !initialData?.provinceCode)) {
      toast.error('Vui lòng chọn một địa chỉ chuẩn từ danh sách gợi ý.')
      return
    }

    if (needsVerification && (!idCardFront || !idCardBack || verificationDocs.length === 0)) {
      toast.error('Vui lòng tải lên đầy đủ giấy tờ xác minh (CCCD 2 mặt và giấy tờ sở hữu)')
      return
    }

    const formData = new FormData(e.currentTarget)
    let idCardFrontUrl = ''
    let idCardBackUrl = ''
    let verificationDocuments: string[] = []

    try {
      if (needsVerification) {
        const idFiles = [idCardFront!, idCardBack!]
        const idUrls = await uploadVerification.mutateAsync(idFiles)
        idCardFrontUrl = idUrls[0]
        idCardBackUrl = idUrls[1]
        
        const docUrls = await uploadVerification.mutateAsync(verificationDocs)
        verificationDocuments = docUrls
      }

      const payload: CreatePropertyDto = {
        name: formData.get('name') as string,
        type: propertyType,
        status: status,

        province: addressSelection ? undefined : initialData?.province,
        district: addressSelection ? undefined : initialData?.district,
        ward: addressSelection ? undefined : initialData?.ward,
        addressDetail: addressSelection?.addressDetail ?? initialData?.addressDetail ?? '',
        location: addressSelection
          ? {
              provinceCode: addressSelection.provinceCode,
              wardCode: addressSelection.wardCode,
              placeId: addressSelection.placeId,
              sessionToken: addressSelection.sessionToken,
            }
          : undefined,
        floorsCount: formData.get('floorsCount') ? Number(formData.get('floorsCount')) : undefined,
        description: formData.get('description') ? (formData.get('description') as string) : undefined,
        
        ...(needsVerification ? { idCardFrontUrl, idCardBackUrl, verificationDocuments } : {})
      }

      if (isEditing) {
        await updateProperty.mutateAsync(payload)
        toast.success('Cập nhật thành công!')
      } else {
        await createProperty.mutateAsync(payload)
        toast.success('Tạo mới thành công!')
      }
      navigate('/khu-tro')
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!')
    }
  }

  const isSubmitting = createProperty.isPending || updateProperty.isPending || uploadCoverImage.isPending || uploadVerification.isPending

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadCoverImage.mutateAsync(file)
      toast.success('Cập nhật ảnh bìa thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi tải ảnh lên!')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
      </div>
    )
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const s = idx + 1
        return (
          <div key={s} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {s}
            </div>
            {s < totalSteps && (
              <div className={`h-1 w-12 mx-1 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-surface-container-high'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  const stepBasicInfo = (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
        <CardHeader className="border-surface-variant/30 border-b pb-4">
          <CardTitle className="font-headline-sm text-on-surface">Thông tin cơ bản</CardTitle>
          <CardDescription className="font-body-sm text-on-surface-variant">
            Các thông tin chính để định danh nhà trọ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6 pb-2 border-b border-surface-border/50">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-xl bg-surface-container-high border border-surface-border flex items-center justify-center shadow-sm">
                {initialData?.coverImageUrl ? (
                  <img src={initialData.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-on-surface-variant/50" />
                )}
              </div>
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-2 flex-1 pt-2">
              <Label className="font-label-md text-on-surface">
                Ảnh đại diện khu trọ
              </Label>
              <p className="font-body-sm text-on-surface-variant">
                {isEditing ? 'Nhấn vào ảnh bên cạnh để tải lên ảnh đại diện mới.' : 'Bạn có thể tải ảnh đại diện sau khi hoàn tất tạo khu trọ.'}
              </p>
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="font-label-md text-on-surface">
              Tên tòa nhà / Nhà trọ <span className="text-error">*</span>
            </Label>
            <div className="relative">
              <Building2 className="text-on-surface-variant absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
              <Input
                id="name"
                name="name"
                placeholder="VD: Chung cư mini Tôn Thất Thuyết"
                defaultValue={initialData?.name}
                className="bg-surface border-surface-border focus-visible:ring-primary/20 focus-visible:border-primary h-11 rounded-xl pl-10"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-label-md text-on-surface">
                Loại hình
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="type" className="bg-surface border-surface-border h-11 rounded-xl">
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DORM">Phòng trọ / Ký túc xá</SelectItem>
                  <SelectItem value="MINI_APARTMENT">Chung cư mini</SelectItem>
                  <SelectItem value="HOUSE">Nhà nguyên căn</SelectItem>
                  <SelectItem value="APARTMENT">Chung cư</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="font-label-md text-on-surface">
                Trạng thái
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="bg-surface border-surface-border h-11 rounded-xl">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm overflow-visible">
        <CardHeader className="border-surface-variant/30 border-b pb-4">
          <CardTitle className="font-headline-sm text-on-surface">Vị trí & Địa chỉ</CardTitle>
          <CardDescription className="font-body-sm text-on-surface-variant">
            Để dễ dàng quản lý và hiển thị trên bản đồ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <AddressPicker
            initial={{
              provinceCode: initialData?.provinceCode,
              province: initialData?.province,
              wardCode: initialData?.wardCode,
              ward: initialData?.ward,
              addressDetail: initialData?.addressDetail,
              latitude: initialData?.latitude,
              longitude: initialData?.longitude,
            }}
            onChange={setAddressSelection}
          />
        </CardContent>
      </Card>
    </div>
  )

  const stepVerification = (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
        <CardHeader className="border-surface-variant/30 border-b pb-4">
          <CardTitle className="font-headline-sm text-on-surface">Xác minh danh tính chủ trọ</CardTitle>
          <CardDescription className="font-body-sm text-on-surface-variant text-error">
            Tài khoản của bạn chưa được xác minh. Vui lòng tải lên giấy tờ để tăng độ tin cậy và hiển thị tích xanh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-label-md text-on-surface">Ảnh mặt trước CCCD <span className="text-error">*</span></Label>
              <div 
                className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:bg-surface-container transition-colors"
                onClick={() => idFrontRef.current?.click()}
              >
                {idCardFront ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium">{idCardFront.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-on-surface-variant mb-2" />
                    <span className="text-sm text-on-surface-variant">Nhấn để chọn ảnh mặt trước</span>
                  </div>
                )}
              </div>
              <input type="file" className="hidden" ref={idFrontRef} accept="image/*" onChange={(e) => e.target.files?.[0] && setIdCardFront(e.target.files[0])} />
            </div>

            <div className="space-y-2">
              <Label className="font-label-md text-on-surface">Ảnh mặt sau CCCD <span className="text-error">*</span></Label>
              <div 
                className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:bg-surface-container transition-colors"
                onClick={() => idBackRef.current?.click()}
              >
                {idCardBack ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium">{idCardBack.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 text-on-surface-variant mb-2" />
                    <span className="text-sm text-on-surface-variant">Nhấn để chọn ảnh mặt sau</span>
                  </div>
                )}
              </div>
              <input type="file" className="hidden" ref={idBackRef} accept="image/*" onChange={(e) => e.target.files?.[0] && setIdCardBack(e.target.files[0])} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-label-md text-on-surface">Giấy tờ sở hữu/Quản lý nhà trọ <span className="text-error">*</span></Label>
            <div 
              className="border-2 border-dashed border-surface-border rounded-xl p-6 text-center cursor-pointer hover:bg-surface-container transition-colors"
              onClick={() => docsRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 text-on-surface-variant mb-2" />
                <span className="text-sm text-on-surface-variant">
                  {verificationDocs.length > 0 ? `Đã chọn ${verificationDocs.length} tệp` : 'Chọn sổ đỏ, hợp đồng thuê nhà hoặc giấy phép kinh doanh'}
                </span>
              </div>
            </div>
            <input type="file" multiple className="hidden" ref={docsRef} accept="image/*" onChange={(e) => e.target.files && setVerificationDocs(Array.from(e.target.files))} />
            {verificationDocs.length > 0 && (
              <div className="mt-2 space-y-1">
                {verificationDocs.map((file, i) => (
                  <div key={i} className="text-sm text-on-surface-variant flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const stepDetails = (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <Card className="bg-surface-container-lowest border-surface-border rounded-2xl shadow-sm">
        <CardHeader className="border-surface-variant/30 border-b pb-4">
          <CardTitle className="font-headline-sm text-on-surface">Chi tiết & Hình ảnh</CardTitle>
          <CardDescription className="font-body-sm text-on-surface-variant">
            Mô tả thêm thông tin cho khu trọ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="floorsCount" className="font-label-md text-on-surface">
              Số lượng tầng (Tùy chọn)
            </Label>
            <Input
              id="floorsCount"
              name="floorsCount"
              type="number"
              defaultValue={initialData?._count?.floors}
              placeholder="VD: 3"
              min={1}
              max={50}
              className="bg-surface border-surface-border focus-visible:ring-primary/20 focus-visible:border-primary h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="description" className="font-label-md text-on-surface">
              Mô tả chi tiết (Tùy chọn)
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả về khu trọ, tiện ích chung, quy định chung..."
              defaultValue={initialData?.description}
              className="bg-surface border-surface-border focus-visible:ring-primary/20 focus-visible:border-primary min-h-[120px] rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* Header */}
      <div className="bg-surface-container-lowest border-surface-border flex items-center gap-4 rounded-2xl border p-6 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-surface-container-low hover:bg-surface-container rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            {isEditing ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ mới'}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-body-md text-on-surface-variant">
              {isEditing ? 'Cập nhật thông tin cơ sở kinh doanh của bạn' : 'Thiết lập thông tin cho tòa nhà/cơ sở mới'}
            </p>
          </div>
        </div>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            className="text-error border-error/50 hover:bg-error/10 hover:text-error bg-error/5 hidden sm:flex"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa nhà trọ
          </Button>
        )}
      </div>

      {renderStepIndicator()}

      <form id="property-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {step === 1 && stepBasicInfo}
        {needsVerification && step === 2 && stepVerification}
        {(step === 3 || (!needsVerification && step === 2)) && stepDetails}

        {/* Sticky Action Bar */}
        <div className="bg-surface/90 border-surface-border fixed right-0 bottom-0 left-[272px] z-20 flex justify-between gap-4 border-t p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="font-label-md border-surface-border bg-surface hover:bg-surface-container h-11 rounded-full px-6"
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          ) : (
            <div /> // placeholder to align right buttons
          )}
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              className="font-label-md h-11 rounded-full px-6"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            
            <Button
              type="submit"
              className="font-label-md bg-primary text-on-primary hover:bg-primary/90 h-11 rounded-full px-8 shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : step < totalSteps ? (
                <ArrowRight className="ml-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {step < totalSteps ? 'Tiếp tục' : 'Hoàn tất'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
