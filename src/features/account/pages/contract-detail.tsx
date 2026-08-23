import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, FileText, CheckCircle2, CalendarDays, Building, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import { TerminationRequest } from '@/features/contracts/components/termination-request'
import { AssetHandover } from '@/features/contracts/components/asset-handover'

export default function ContractDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ['my-contract-detail', id],
    queryFn: () => apiClient.get(`/contracts/me/${id}`).then((r) => r.data),
    enabled: !!id,
  })

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
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hop-dong')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Chi tiết hợp đồng
            </h1>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
          Đang tải dữ liệu hợp đồng...
        </div>
      </div>
    )
  }

  if (isError || !contract) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hop-dong')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          Không thể tải thông tin hợp đồng. Hợp đồng có thể không tồn tại hoặc bạn không có quyền truy cập.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-white p-6 md:flex-row md:items-center shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hop-dong')} className="bg-slate-100 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Hợp đồng {contract.contractCode || `HD-${contract.id}`}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <Badge
                className={
                  contract.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none'
                }
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current"></span>
                {contract.status === 'ACTIVE'
                  ? 'Đang hoạt động'
                  : contract.status === 'DRAFT'
                    ? 'Bản nháp'
                    : contract.status === 'WAITING_RENTER_SIGN'
                      ? 'Chờ bạn ký'
                      : contract.status === 'CANCELED'
                        ? 'Đã hủy'
                        : contract.status}
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" /> Bắt đầu {new Date(contract.startDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
            >
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger
              value="handovers"
              className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
            >
              Bàn giao tài sản
            </TabsTrigger>
            <TabsTrigger
              value="end"
              className="rounded-none border-b-2 border-transparent bg-transparent px-1 py-3 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
            >
              Kết thúc hợp đồng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Thông tin tổng quan */}
            <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl"></div>

              <div className="p-5">
                <div className="mb-6 flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-1 text-blue-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">Thông tin tổng quan</h2>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">PHÒNG THUÊ</div>
                      <div className="flex items-center gap-2 text-lg font-medium text-slate-900">
                        <Building className="h-5 w-5 text-slate-400" />
                        {contract.room?.title || `Phòng ${contract.roomId}`}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                        NGƯỜI ĐỨNG TÊN
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-600">
                          {contract.renter?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-base font-semibold text-slate-900">
                            {contract.renter?.fullName || 'Chưa cập nhật'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <Phone className="w-3.5 h-3.5" /> {contract.renter?.phone || 'Chưa cập nhật SDT'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                    <div className="space-y-5">
                      <div>
                        <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                          GIÁ THUÊ CƠ BẢN
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN').format(contract.monthlyPrice)}{' '}
                          <span className="text-blue-600 underline decoration-blue-300">đ</span>
                          <span className="text-sm font-normal text-slate-500">/tháng</span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                          TIỀN CỌC ĐÃ ĐÓNG
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
          </TabsContent>

          <TabsContent value="handovers" className="mt-6">
            <AssetHandover contractId={Number(id)} isLandlord={false} status="DRAFT" />
          </TabsContent>

          <TabsContent value="end" className="mt-6">
            <TerminationRequest contractId={Number(id)} isLandlord={false} status="NONE" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

