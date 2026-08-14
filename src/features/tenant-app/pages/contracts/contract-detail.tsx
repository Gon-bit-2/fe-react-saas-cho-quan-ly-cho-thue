import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { FileText, Printer, XCircle, User, Users, Phone, CheckCircle2, CalendarDays, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useContract, useCancelContract, useActivateContract } from '@/shared/api/contracts'

// --- Mock History Data ---
const MOCK_HISTORY = [
  {
    id: 1,
    time: 'Hôm nay, 10:23 AM',
    title: 'Đã gửi thông báo đóng tiền',
    desc: 'Gửi tự động qua Zalo cho Nguyễn Văn A.',
    active: true,
  },
  {
    id: 2,
    time: '15/09/2023, 14:00 PM',
    title: 'Kích hoạt hợp đồng',
    desc: 'Admin đã chuyển trạng thái từ Nháp sang Đang hoạt động.',
    active: false,
  },
  {
    id: 3,
    time: '15/09/2023, 09:15 AM',
    title: 'Thêm thành viên',
    desc: 'Admin đã thêm Trần Thị B vào hợp đồng.',
    active: false,
  },
  {
    id: 4,
    time: '14/09/2023, 16:30 PM',
    title: 'Tạo hợp đồng (Nháp)',
    desc: 'Khởi tạo hợp đồng cho Phòng A302.',
    active: false,
  },
]

export default function ContractDetailPage() {
  const { id } = useParams()
  const { data: contract, isLoading } = useContract(Number(id))
  const { mutate: cancelContract, isPending: isCanceling } = useCancelContract(Number(id))
  const { mutate: activateContract, isPending: isActivating } = useActivateContract(Number(id))

  const { durationMonths, monthsLeft, progressPercent } = useMemo(() => {
    if (!contract) return { durationMonths: 0, monthsLeft: 0, progressPercent: 0 }

    const start = new Date(contract.startDate)
    const end = new Date(contract.endDate)
    const now = new Date()

    const totalDiff = end.getTime() - start.getTime()
    const elapsedDiff = now.getTime() - start.getTime()

    const durationMonths = Math.round(totalDiff / (1000 * 60 * 60 * 24 * 30))
    const elapsedMonths = Math.max(0, Math.round(elapsedDiff / (1000 * 60 * 60 * 24 * 30)))
    const monthsLeft = Math.max(0, durationMonths - elapsedMonths)

    let percent = (elapsedDiff / totalDiff) * 100
    if (percent < 0) percent = 0
    if (percent > 100) percent = 100

    return { durationMonths, monthsLeft, progressPercent: percent }
  }, [contract])

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Đang tải dữ liệu...</div>
  }

  if (!contract) {
    return <div className="p-6 text-center text-slate-500">Hợp đồng không tồn tại</div>
  }

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy hợp đồng này?')) {
      cancelContract()
    }
  }

  const handleActivate = () => {
    if (
      window.confirm('Bạn có chắc chắn muốn kích hoạt hợp đồng này? Hợp đồng sẽ chuyển sang trạng thái Đang hoạt động.')
    ) {
      activateContract()
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hợp đồng {contract.contractCode || `HD-${contract.id}`}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <Badge
                className={
                  contract.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                }
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current"></span>
                {contract.status === 'ACTIVE'
                  ? 'Đang hoạt động'
                  : contract.status === 'DRAFT'
                    ? 'Bản nháp'
                    : contract.status === 'CANCELED'
                      ? 'Đã hủy'
                      : contract.status}
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" /> Tạo ngày {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-slate-600">
            <Printer className="mr-2 h-4 w-4" />
            In hợp đồng
          </Button>
          {(contract.status === 'DRAFT' ||
            contract.status === 'WAITING_LANDLORD_SIGN' ||
            contract.status === 'WAITING_RENTER_SIGN') && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleActivate}
              disabled={isActivating}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Kích hoạt
            </Button>
          )}
          {contract.status !== 'CANCELED' && contract.status !== 'TERMINATED' && (
            <Button
              variant="outline"
              className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy hợp đồng
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                Thành viên
              </TabsTrigger>
              <TabsTrigger
                value="handovers"
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                Bàn giao
              </TabsTrigger>
              <TabsTrigger
                value="end"
                className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              >
                Kết thúc
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Thông tin tổng quan Card */}
              <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-1">
                <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl"></div>

                <div className="p-5">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-1 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Thông tin tổng quan</h2>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Cột trái */}
                    <div className="space-y-6">
                      <div>
                        <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">PHÒNG</div>
                        <div className="flex items-center gap-2 text-lg font-medium text-slate-900">
                          <Building className="h-5 w-5 text-slate-400" />
                          {contract.room?.title || `Phòng ${contract.roomId}`}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                          NGƯỜI THUÊ CHÍNH
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-600">
                            {contract.renter?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-base font-semibold text-slate-900">
                              {contract.renter?.fullName || 'Chưa cập nhật'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {contract.renter?.phone || 'Chưa cập nhật SDT'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                          CCCD/CMND
                        </div>
                        <div className="text-base text-slate-900">
                          {contract.renter?.renterProfile?.identityNumber || 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>

                    {/* Cột phải */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <div className="space-y-5">
                        <div>
                          <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            GIÁ THUÊ
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN').format(contract.monthlyPrice)}{' '}
                            <span className="text-blue-600 underline decoration-blue-300">đ</span>
                            <span className="text-sm font-normal text-slate-500">/tháng</span>
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            TIỀN CỌC
                          </div>
                          <div className="text-lg font-semibold text-slate-900">
                            {new Intl.NumberFormat('vi-VN').format(contract.depositAmount)} ₫
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                            THỜI HẠN
                          </div>
                          <div className="mb-2 text-sm font-medium text-slate-900">
                            <span className="font-bold">{durationMonths} tháng</span> (
                            {new Date(contract.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(contract.endDate).toLocaleDateString('vi-VN')})
                          </div>

                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-1.5 rounded-full bg-blue-600"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          <div className="mt-2 text-right text-xs font-medium text-slate-500">
                            Còn {monthsLeft} tháng
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thành viên thuê Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600" />
                    <h2 className="text-lg font-semibold text-slate-800">
                      Thành viên thuê ({contract.members?.length || 1})
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-transparent bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                  >
                    + Thêm
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Người đứng tên */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
                        {contract.renter?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {contract.renter?.fullName || 'Chưa cập nhật'}
                          </span>
                          <Badge className="h-5 bg-blue-600 px-1.5 text-[10px] text-white hover:bg-blue-600">
                            NGƯỜI ĐỨNG TÊN
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contract.renter?.phone || 'Chưa có SĐT'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />{' '}
                            {contract.renter?.renterProfile?.identityNumber || 'Chưa cập nhật'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Co-renters */}
                  {contract.members
                    ?.filter((m) => String(m.userId) !== String(contract.renterId))
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
                            {member.user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{member.user.fullName}</div>
                            <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {member.user.phone || 'Chưa có SĐT'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" /> 079198054321 (Mock)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-6 py-12 text-center text-slate-500">
                  Chi tiết quản lý thành viên...
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="handovers">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-6 py-12 text-center text-slate-500">
                  Chưa có biên bản bàn giao tài sản.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="end">
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-6 py-12 text-center text-slate-500">
                  Chưa có biên bản kết thúc hợp đồng.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Lịch sử hoạt động */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-slate-100 bg-white p-6">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
              <User className="h-5 w-5 text-slate-400" />
              Lịch sử hoạt động
            </h3>

            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent md:before:mx-auto md:before:translate-x-0">
              {MOCK_HISTORY.map((item, index) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  <div
                    className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[3px] border-white shadow-sm ${item.active ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    {item.active && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                  </div>
                  <div className="pb-4">
                    <div className="mb-1 text-[11px] font-medium text-slate-500">{item.time}</div>
                    <div className="mb-1 text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-sm leading-relaxed text-slate-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4 w-full text-slate-600">
              Xem tất cả lịch sử
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
