import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import {
  Mail,
  Phone,
  Building2,
  Star,
  History,
  Lock,
  Unlock,
  Ban,
  FileText,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Home,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminLandlordApi, type Landlord } from '../api/tenant.api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'

export const LandlordDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const landlordId = Number(id)
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const landlord = useQuery({
    queryKey: ['admin', 'landlord', landlordId],
    queryFn: () => adminLandlordApi.get(landlordId).then((r) => r.data),
    enabled: Number.isInteger(landlordId) && landlordId > 0,
  })

  const updateStatus = useMutation({
    mutationFn: (status: Landlord['status']) => adminLandlordApi.updateStatus(landlordId, { status, reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'landlord', landlordId] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'landlords'] })
      setReason('')
      setSelectedAction(null)
      toast.success('Đã cập nhật trạng thái tài khoản')
    },
    onError: () => toast.error('Không thể cập nhật trạng thái tài khoản'),
  })

  if (landlord.isLoading)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-slate-500">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        Đang tải thông tin...
      </div>
    )

  if (!landlord.data)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-slate-500">
        <div className="mb-2 text-xl font-bold">Không tìm thấy tài khoản</div>
        <p>Chủ trọ hoặc Tenant này không tồn tại hoặc đã bị xóa.</p>
      </div>
    )

  const data = landlord.data
  const isBanned = data.status === 'BANNED'
  const isLocked = data.status === 'INACTIVE'
  const isActive = data.status === 'ACTIVE'

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12 duration-500">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/admin/chu-tro" className="text-xs font-semibold tracking-wider uppercase hover:text-blue-600">
              Quản lý chủ trọ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-slate-900">Chi tiết tài khoản</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">LL-{data.id.toString().padStart(4, '0')}</h1>
        </div>
        <Button variant="outline" className="bg-white text-slate-700 shadow-sm hover:bg-slate-50">
          <History className="mr-2 h-4 w-4" /> Lịch sử hoạt động
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column - Profile */}
        <div className="space-y-6 lg:col-span-4">
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-24 bg-gradient-to-r from-blue-100 to-indigo-100">
              <Avatar className="absolute -bottom-12 left-1/2 h-24 w-24 -translate-x-1/2 border-4 border-white shadow-sm">
                <AvatarFallback className="bg-blue-600 text-2xl font-bold text-white">
                  {data.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-10 left-[calc(50%+24px)] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="border-b border-slate-100 px-6 pt-16 pb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">{data.fullName}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {data.systemRole === 'SUPER_ADMIN' ? 'Quản trị viên' : 'Chủ trọ'}
              </p>
            </div>

            <div className="flex border-b border-slate-100">
              <div className="flex-1 border-r border-slate-100 py-4 text-center">
                <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">Tin đăng</div>
                <div className="text-xl font-bold text-blue-700">12</div>
              </div>
              <div className="flex-1 py-4 text-center">
                <div className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">Đánh giá</div>
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-amber-600">
                  4.8 <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <h3 className="text-sm font-bold text-slate-900">Thông tin liên hệ</h3>

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <Mail className="h-3.5 w-3.5" /> Email
                </div>
                <div className="text-sm font-medium text-slate-900">{data.email || 'Chưa cập nhật'}</div>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <Phone className="h-3.5 w-3.5" /> Số điện thoại
                </div>
                <div className="text-sm font-medium text-slate-900">{data.phone || 'Chưa cập nhật'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Giấy tờ tùy thân</h3>
              {data.ownedTenants[0]?.verificationStatus === 'VERIFIED' && (
                <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Đã duyệt
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {data.ownedTenants[0]?.idCardFrontUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <a
                      href={data.ownedTenants[0].idCardFrontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Ảnh CCCD mặt trước
                    </a>
                  </div>
                </div>
              ) : null}

              {data.ownedTenants[0]?.idCardBackUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <a
                      href={data.ownedTenants[0].idCardBackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Ảnh CCCD mặt sau
                    </a>
                  </div>
                </div>
              ) : null}

              {!data.ownedTenants[0]?.idCardFrontUrl && !data.ownedTenants[0]?.idCardBackUrl && (
                <div className="text-sm text-slate-500">Chưa cung cấp giấy tờ</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="space-y-6 lg:col-span-8">
          {/* Subscription Plan */}
          {data.ownedTenants[0]?.subscriptions?.[0] ? (
            <div className="relative overflow-hidden rounded-xl bg-blue-600 p-8 text-white shadow-md">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="h-32 w-32" />
              </div>
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="mb-1 text-sm font-semibold tracking-wider text-blue-200 uppercase">Gói hiện tại</div>
                  <h2 className="mb-2 text-3xl font-bold">{data.ownedTenants[0].subscriptions[0].plan.name}</h2>
                  <ul className="space-y-1 text-sm text-blue-100">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-300"></div> Đăng tối đa{' '}
                      {data.ownedTenants[0].subscriptions[0].plan.maxRooms} phòng
                    </li>
                    {data.ownedTenants[0].subscriptions[0].plan.allowWebhookPayment && (
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-300"></div> Cấu hình Webhook thanh toán tự động
                      </li>
                    )}
                  </ul>
                </div>

                <div className="min-w-[200px] rounded-xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur-sm">
                  <div className="mb-2 text-xs font-semibold tracking-wider text-blue-200 uppercase">Hết hạn vào</div>
                  <div className="mb-4 text-2xl font-bold">
                    {new Date(data.ownedTenants[0].subscriptions[0].expiredAt).toLocaleDateString('vi-VN')}
                  </div>
                  <Button variant="secondary" className="w-full bg-white font-bold text-blue-700 hover:bg-blue-50">
                    Nâng cấp gói
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl bg-slate-700 p-8 text-white shadow-md">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp className="h-32 w-32" />
              </div>
              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="mb-1 text-sm font-semibold tracking-wider text-slate-200 uppercase">Gói hiện tại</div>
                  <h2 className="mb-2 text-3xl font-bold">Chưa đăng ký gói</h2>
                  <p className="text-sm text-slate-100">Khách hàng chưa đăng ký gói dịch vụ nào hoặc gói đã hết hạn.</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Status / Moderation Action */}
          <div className="overflow-hidden rounded-xl rounded-l-none border-l-4 border-slate-900 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <div className="mb-2 flex items-center gap-3">
                <ShieldIcon status={data.status} />
                <h3 className="text-lg font-bold text-slate-900">Trạng thái tài khoản</h3>
              </div>
              <p className="text-sm text-slate-500">
                Quản lý quyền truy cập và hoạt động của chủ trọ trên hệ thống. Hiện tại tài khoản đang
                <span
                  className={`ml-1 font-bold ${isActive ? 'text-emerald-600' : isLocked ? 'text-amber-600' : 'text-red-600'}`}
                >
                  {isActive ? 'HOẠT ĐỘNG' : isLocked ? 'TẠM KHÓA' : 'BỊ ĐÌNH CHỈ'}
                </span>
                .
              </p>
            </div>

            <div className="bg-slate-50/50 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                  onClick={() => setSelectedAction('INACTIVE')}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    selectedAction === 'INACTIVE' || isLocked
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
                  }`}
                >
                  <Lock
                    className={`mx-auto mb-2 h-8 w-8 ${selectedAction === 'INACTIVE' || isLocked ? 'text-amber-600' : 'text-slate-400'}`}
                  />
                  <div
                    className={`font-bold ${selectedAction === 'INACTIVE' || isLocked ? 'text-amber-700' : 'text-slate-700'}`}
                  >
                    Tạm khóa
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Giới hạn đăng tin mới</div>
                </button>

                <button
                  onClick={() => setSelectedAction('ACTIVE')}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    selectedAction === 'ACTIVE' || isActive
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <Unlock
                    className={`mx-auto mb-2 h-8 w-8 ${selectedAction === 'ACTIVE' || isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                  />
                  <div
                    className={`font-bold ${selectedAction === 'ACTIVE' || isActive ? 'text-emerald-700' : 'text-slate-700'}`}
                  >
                    Mở khóa
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Tài khoản hoạt động</div>
                </button>

                <button
                  onClick={() => setSelectedAction('BANNED')}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    selectedAction === 'BANNED' || isBanned
                      ? 'border-red-400 bg-red-50/50'
                      : 'border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/30'
                  }`}
                >
                  <Ban
                    className={`mx-auto mb-2 h-8 w-8 ${selectedAction === 'BANNED' || isBanned ? 'text-red-600' : 'text-slate-400'}`}
                  />
                  <div
                    className={`font-bold ${selectedAction === 'BANNED' || isBanned ? 'text-red-700' : 'text-slate-700'}`}
                  >
                    Đình chỉ vĩnh viễn
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Hủy toàn bộ dịch vụ</div>
                </button>
              </div>

              {selectedAction && selectedAction !== data.status && (
                <div className="animate-in fade-in zoom-in-95 mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm duration-200">
                  <h4 className="mb-2 text-sm font-bold text-slate-900">Xác nhận thay đổi trạng thái</h4>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Vui lòng nhập lý do cụ thể..."
                    className="mb-3 resize-none bg-slate-50 focus-visible:ring-slate-300"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedAction(null)
                        setReason('')
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      className={
                        selectedAction === 'BANNED'
                          ? 'bg-red-600 hover:bg-red-700'
                          : selectedAction === 'INACTIVE'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                      }
                      disabled={reason.trim().length < 3 || updateStatus.isPending}
                      onClick={() => updateStatus.mutate(selectedAction as Landlord['status'])}
                    >
                      {updateStatus.isPending ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Overview */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tổng quan tài sản</h3>
                <p className="text-sm text-slate-500">Danh sách nhà trọ/chung cư mini thuộc sở hữu.</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-50 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Tổng cộng: {data.ownedTenants.length} cơ sở
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/50 p-6 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-500">SỐ LƯỢNG TÒA NHÀ</div>
                  <div className="text-3xl font-bold text-slate-900">{data.ownedTenants.length}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-500">TỔNG SỐ PHÒNG (ĐANG QUẢN LÝ)</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {data.ownedTenants.reduce((acc, t) => acc + (t._count?.rooms || 0), 0)}
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Home className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="p-0">
              {data.ownedTenants.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <Building2 className="h-8 w-8 text-slate-300" />
                  </div>
                  Chưa có dữ liệu cơ sở kinh doanh.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Table Header mock */}
                  <div className="grid grid-cols-12 gap-4 bg-slate-50 px-6 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    <div className="col-span-5">Tên cơ sở</div>
                    <div className="col-span-3">Số lượng phòng</div>
                    <div className="col-span-4 text-right">Trạng thái</div>
                  </div>

                  {data.ownedTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="grid grid-cols-12 items-center gap-4 p-6 transition-colors hover:bg-slate-50/50"
                    >
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <Building2 className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{tenant.name}</h4>
                          <span className="font-mono text-xs text-slate-500">
                            ID: BLD-{tenant.id.toString().padStart(3, '0')}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm font-medium text-slate-700">{tenant._count?.rooms || 0} phòng</div>
                      </div>
                      <div className="col-span-4 flex justify-end">
                        {tenant.status === 'ACTIVE' ? (
                          <Badge className="border-transparent bg-emerald-100 text-emerald-700 shadow-sm hover:bg-emerald-100">
                            Đang vận hành
                          </Badge>
                        ) : (
                          <Badge className="border-transparent bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200">
                            Tạm dừng
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldIcon({ status }: { status: string }) {
  if (status === 'ACTIVE') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    )
  }
  if (status === 'INACTIVE') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Lock className="h-5 w-5" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
      <Ban className="h-5 w-5" />
    </div>
  )
}
