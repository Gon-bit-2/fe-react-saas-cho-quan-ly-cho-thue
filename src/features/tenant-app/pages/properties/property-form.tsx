import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useUploadPropertyCoverImage,
  useUploadPropertyVerification,
} from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Building2, ImageIcon, Save, Trash2, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CreatePropertyDto } from '@/features/tenant-app/types'
import { AddressPicker, type AddressSelection } from '@/shared/components/address-picker'
import { useAuth } from '@/shared/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Trang Thêm mới / Chỉnh sửa thông tin Khu trọ / Tòa nhà.
 * Hỗ trợ các bước (Wizard): Thông tin cơ bản & địa chỉ -> Giấy tờ xác minh (nếu chưa verify) -> Thông tin chi tiết số tầng & mô tả.
 */
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
  const deleteProperty = useDeleteProperty(Number(id))
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Verification files
  const [idCardFront, setIdCardFront] = useState<File | null>(null)
  const [idCardBack, setIdCardBack] = useState<File | null>(null)
  const [verificationDocs, setVerificationDocs] = useState<File[]>([])

  const propertyType = (propertyTypeState ?? initialData?.type ?? 'MINI_APARTMENT') as CreatePropertyDto['type']
  const status = (statusState ?? initialData?.status ?? 'ACTIVE') as NonNullable<CreatePropertyDto['status']>

  /**
   * Chuyển sang bước tiếp theo với validation dữ liệu cơ bản.
   */
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

  /**
   * Quay lại bước trước đó.
   */
  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1))
  }

  /**
   * Mở hộp thoại xác nhận xóa khu trọ.
   */
  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  /**
   * Xác nhận và gửi API xóa khu trọ.
   */
  const confirmDelete = async () => {
    try {
      await deleteProperty.mutateAsync()
      toast.success('Đã xóa khu trọ thành công!')
      navigate('/khu-tro')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà trọ.')
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  /**
   * Xử lý submit toàn bộ form tạo mới hoặc cập nhật khu trọ.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (step < totalSteps) {
      handleNext()
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      let idCardFrontUrl = ''
      let idCardBackUrl = ''
      const verificationDocuments: string[] = []

      if (needsVerification) {
        if (!idCardFront || !idCardBack || verificationDocs.length === 0) {
          toast.error('Vui lòng tải lên đầy đủ giấy tờ xác minh (CCCD 2 mặt và giấy tờ sở hữu)')
          return
        }

        toast.info('Đang tải lên tài liệu xác minh...')

        const [frontRes, backRes] = await Promise.all([
          uploadVerification.mutateAsync(idCardFront),
          uploadVerification.mutateAsync(idCardBack),
        ])
        idCardFrontUrl = frontRes.url
        idCardBackUrl = backRes.url

        const docsRes = await Promise.all(verificationDocs.map((doc) => uploadVerification.mutateAsync(doc)))
        docsRes.forEach((res) => verificationDocuments.push(res.url))
      }

      const payload: CreatePropertyDto = {
        name: formData.get('name') as string,
        type: propertyType,
        status: status,

        province: addressSelection ? undefined : initialData?.province,
        district: addressSelection ? undefined : initialData?.district,
        ward: addressSelection ? undefined : initialData?.ward,
        addressDetail: addressSelection?.addressDetail || initialData?.addressDetail || 'Chưa có thông tin số nhà',
        location: addressSelection?.provinceCode && addressSelection?.wardCode
          ? {
              provinceCode: addressSelection.provinceCode,
              wardCode: addressSelection.wardCode,
              placeId: addressSelection.placeId || 'unknown',
              sessionToken: addressSelection.sessionToken,
            }
          : undefined,
        floorsCount: formData.get('floorsCount') ? Number(formData.get('floorsCount')) : undefined,
        description: formData.get('description') ? (formData.get('description') as string) : undefined,

        ...(needsVerification ? { idCardFrontUrl, idCardBackUrl, verificationDocuments } : {}),
      }

      if (isEditing) {
        await updateProperty.mutateAsync(payload)
        toast.success('Cập nhật thành công!')
      } else {
        await createProperty.mutateAsync(payload)
        toast.success('Tạo mới thành công!')
      }
      navigate('/khu-tro')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const data = err?.response?.data
      let errorMessage = 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!'
      
      if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
        const firstDetail = data.details[0]
        errorMessage = typeof firstDetail === 'string' ? firstDetail : firstDetail.message || 'Lỗi dữ liệu đầu vào'
      } else if (data?.message) {
        errorMessage = Array.isArray(data.message) ? data.message[0] : data.message
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      toast.error(errorMessage)
      console.error('Submit error:', data || err)
    }
  }

  const isSubmitting =
    createProperty.isPending || updateProperty.isPending || deleteProperty.isPending || uploadCoverImage.isPending || uploadVerification.isPending

  /**
   * Tải ảnh bìa trực tiếp cho khu trọ khi đang chỉnh sửa.
   */
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
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">Đang tải dữ liệu khu trọ...</span>
        </div>
      </div>
    )
  }

  const handleStepClick = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep)
      return
    }

    if (targetStep >= 2 && step < 2) {
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

    if (targetStep >= 3 && step < 3 && needsVerification) {
      if (!idCardFront || !idCardBack || verificationDocs.length === 0) {
        toast.error('Vui lòng tải lên đầy đủ giấy tờ xác minh (CCCD 2 mặt và giấy tờ sở hữu)')
        return
      }
    }

    setStep(targetStep)
  }

  const stepLabels = needsVerification
    ? ['Thông tin cơ bản & Vị trí', 'Xác minh danh tính', 'Chi tiết & Quy mô']
    : ['Thông tin cơ bản & Vị trí', 'Chi tiết & Quy mô']

  const renderStepIndicator = () => (
    <div className="mb-6 flex flex-col items-center">
      <div className="flex items-center gap-3">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const s = idx + 1
          const isActive = step === s
          const isDone = step > s
          return (
            <div key={s} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(s)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : s}
              </button>
              {s < totalSteps && (
                <div
                  className={`mx-2 h-0.5 w-12 sm:w-20 transition-colors ${
                    step > s ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <span className="text-xs font-medium text-slate-500 mt-2">
        Bước {step}: {stepLabels[step - 1]}
      </span>
    </div>
  )

  const stepBasicInfo = (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Thông tin cơ bản</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Tên và loại hình bất động sản cho thuê
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100">
            <div className="relative group">
              <div className="h-20 w-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-400">
                {initialData?.coverImageUrl ? (
                  <img src={initialData.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-slate-300" />
                )}
              </div>
              {isEditing && (
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <Label className="text-sm font-semibold text-slate-800">Ảnh đại diện khu trọ</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Nhấn vào ảnh để tải lên ảnh bìa mới cho cơ sở.'
                  : 'Bạn có thể cập nhật ảnh bìa sau khi lưu khu trọ.'}
              </p>
              <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Tên tòa nhà / Khu trọ <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                name="name"
                placeholder="VD: Chung cư mini Sunrise Tower"
                defaultValue={initialData?.name}
                className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold text-slate-700">
                Loại hình
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger id="type" className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DORM" className="text-xs">Phòng trọ / Ký túc xá</SelectItem>
                  <SelectItem value="MINI_APARTMENT" className="text-xs">Chung cư mini</SelectItem>
                  <SelectItem value="HOUSE" className="text-xs">Nhà nguyên căn</SelectItem>
                  <SelectItem value="APARTMENT" className="text-xs">Căn hộ chung cư</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold text-slate-700">
                Trạng thái vận hành
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="h-9 text-sm border-slate-200">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="text-xs">Đang hoạt động</SelectItem>
                  <SelectItem value="MAINTENANCE" className="text-xs">Bảo trì / Sửa chữa</SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm overflow-visible">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Vị trí & Địa chỉ</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Tìm kiếm địa chỉ chuẩn xác để định vị trên bản đồ số
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
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
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Xác minh danh tính chủ trọ</CardTitle>
          <CardDescription className="text-xs text-amber-600 mt-0.5">
            Tài khoản của bạn chưa được xác minh. Vui lòng tải lên giấy tờ để tăng độ tin cậy và hiển thị huy hiệu xác thực.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Ảnh mặt trước CCCD <span className="text-red-500">*</span>
              </Label>
              <div
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 cursor-pointer rounded-xl p-5 text-center transition-colors"
                onClick={() => idFrontRef.current?.click()}
              >
                {idCardFront ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-1" />
                    <span className="text-xs font-medium text-slate-800 truncate max-w-xs">{idCardFront.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Chọn ảnh mặt trước</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                ref={idFrontRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setIdCardFront(e.target.files[0])}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Ảnh mặt sau CCCD <span className="text-red-500">*</span>
              </Label>
              <div
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 cursor-pointer rounded-xl p-5 text-center transition-colors"
                onClick={() => idBackRef.current?.click()}
              >
                {idCardBack ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 mb-1" />
                    <span className="text-xs font-medium text-slate-800 truncate max-w-xs">{idCardBack.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Chọn ảnh mặt sau</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                ref={idBackRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && setIdCardBack(e.target.files[0])}
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-semibold text-slate-700">
              Giấy tờ chứng minh quyền sở hữu / Quản lý <span className="text-red-500">*</span>
            </Label>
            <div
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 cursor-pointer rounded-xl p-5 text-center transition-colors"
              onClick={() => docsRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <FileText className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">
                  {verificationDocs.length > 0
                    ? `Đã chọn ${verificationDocs.length} tệp tài liệu`
                    : 'Tải lên sổ đỏ, hợp đồng ủy quyền hoặc giấy phép kinh doanh'}
                </span>
              </div>
            </div>
            <input
              type="file"
              multiple
              className="hidden"
              ref={docsRef}
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && setVerificationDocs(Array.from(e.target.files))}
            />
            {verificationDocs.length > 0 && (
              <div className="mt-2 space-y-1">
                {verificationDocs.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{file.name}</span>
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
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900">Chi tiết quy mô & Mô tả</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Cung cấp thêm thông tin về cơ sở vật chất và quy định chung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="floorsCount" className="text-xs font-semibold text-slate-700">
              Số lượng tầng (Tùy chọn)
            </Label>
            <Input
              id="floorsCount"
              name="floorsCount"
              type="number"
              defaultValue={initialData?._count?.floors}
              placeholder="VD: 5"
              min={1}
              max={50}
              className="h-9 text-sm border-slate-200 max-w-xs"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Mô tả chi tiết khu trọ
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Giới thiệu về tiện ích chung: khóa vân tay, camera an ninh, giờ giấc tự do, khu để xe..."
              defaultValue={initialData?.description}
              className="min-h-[120px] text-sm border-slate-200"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-lg border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Chỉnh sửa khu trọ' : 'Thêm khu trọ mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Cập nhật thông tin cơ sở kinh doanh' : 'Thiết lập thông tin cho tòa nhà/khu trọ mới'}
            </p>
          </div>
        </div>
        {isEditing && (
          <Button
            type="button"
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Xóa khu trọ
          </Button>
        )}
      </div>

      {renderStepIndicator()}

      <form id="property-form" onSubmit={handleSubmit} className="space-y-6">
        <div className={step === 1 ? 'block' : 'hidden'}>{stepBasicInfo}</div>
        <div className={needsVerification && step === 2 ? 'block' : 'hidden'}>{stepVerification}</div>
        <div className={step === 3 || (!needsVerification && step === 2) ? 'block' : 'hidden'}>{stepDetails}</div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-[272px] z-20 bg-white/95 border-t border-slate-200 p-4 shadow-md backdrop-blur-sm flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-9 px-4 gap-1.5 border-slate-200"
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-9 px-4 text-slate-600"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-5 gap-1.5 shadow-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" />
              ) : step < totalSteps ? (
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              {step < totalSteps ? 'Tiếp tục' : 'Hoàn tất & Lưu'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Xác nhận xóa khu trọ</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Bạn có chắc chắn muốn xóa khu trọ này không? Dữ liệu phòng và các thông tin liên quan sẽ không còn khả dụng trên hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteProperty.isPending}
              className="text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={deleteProperty.isPending}
              className="text-xs"
            >
              {deleteProperty.isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
