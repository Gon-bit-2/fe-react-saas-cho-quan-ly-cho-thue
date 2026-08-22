import { useParams, Link } from 'react-router'
import { useState } from 'react'
import { useHandover, useConfirmHandover } from '@/shared/api/handovers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { HANDOVER_STATUS_MAP, ASSET_CONDITION_MAP } from '@/shared/constants/status-config'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Camera, User, FileSignature, CheckCircle } from 'lucide-react'
import type { HandoverAssetItem, AssetCondition } from '@/types/asset'
import { Input } from '@/components/ui/input'

const ConditionBadge = ({ condition }: { condition: string }) => {
  return <StatusBadge status={condition} statusMap={ASSET_CONDITION_MAP} fallbackLabel={condition} />
}

export default function HandoverDetail() {
  const { id } = useParams()
  const { data: handover, isLoading } = useHandover(Number(id))
  const confirmHandover = useConfirmHandover(Number(id))

  const [notes, setNotes] = useState('')
  const [assetItems, setAssetItems] = useState<HandoverAssetItem[]>([])

  // Init state from data
  if (handover && assetItems.length === 0 && handover.items.length > 0) {
    setAssetItems(handover.items)
    setNotes(handover.note || '')
  }

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    )
  if (!handover) return <div className="py-10 text-center">Không tìm thấy biên bản bàn giao</div>

  const isCompleted = handover.status === 'CONFIRMED'
  const progress = isCompleted
    ? 100
    : Math.round((assetItems.filter((i) => i.condition).length / Math.max(assetItems.length, 1)) * 100)

  const handleConfirm = () => {
    confirmHandover.mutate(
      { version: handover.version },
      {
        onSuccess: () => {
          toast.success('Đã hoàn tất bàn giao!')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi xác nhận bàn giao')
        },
      },
    )
  }

  const updateItemCondition = (itemId: number, condition: AssetCondition) => {
    if (isCompleted) return
    setAssetItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, condition } : item)))
  }

  const updateItemNote = (itemId: number, note: string) => {
    if (isCompleted) return
    setAssetItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, note } : item)))
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bàn giao & Kiểm kê tài sản</h1>
          <p className="mt-1 text-sm text-slate-500">
            Hợp đồng #{handover.contractId} • Phòng {handover.roomId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {handover.status === 'DISPUTED' ? (
            <Button variant="destructive" asChild>
              <Link to={`/ban-giao/${handover.id}/tranh-chap`}>Xử lý tranh chấp</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <StatusBadge status={handover.status} statusMap={HANDOVER_STATUS_MAP} fallbackLabel={handover.status} />
              {!isCompleted && (
                <Button
                  onClick={handleConfirm}
                  disabled={confirmHandover.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Hoàn tất bàn giao
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin chung */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-lg">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Loại bàn giao</p>
                <p className="flex items-center font-medium text-slate-900">
                  {handover.type === 'CHECKIN' ? 'Check-in (Chuyển đến)' : 'Check-out (Chuyển đi)'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Ngày thực hiện</p>
                <p className="font-medium text-slate-900">{new Date(handover.handoverDate).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Nhân viên phụ trách
                </p>
                <p className="flex items-center gap-2 font-medium text-slate-900">
                  <User className="h-4 w-4 text-slate-400" /> System Admin
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">Tiến độ kiểm kê</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {assetItems.filter((i) => i.condition).length}/{assetItems.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danh mục tài sản */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-lg">Danh mục tài sản</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0">
              {assetItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Phòng không có tài sản nào cần kiểm kê.</div>
              ) : (
                assetItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-5 p-5 sm:flex-row">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.assetName} className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.assetName}</h4>
                          <p className="mt-0.5 text-sm text-slate-500">
                            SL: {item.expectedQuantity} • Danh mục: {item.categoryName}
                          </p>
                        </div>

                        {isCompleted ? (
                          <ConditionBadge condition={item.condition} />
                        ) : (
                          <div className="flex items-center rounded-lg bg-slate-100 p-1">
                            {(['GOOD', 'DAMAGED', 'LOST'] as AssetCondition[]).map((cond) => (
                              <button
                                key={cond}
                                onClick={() => updateItemCondition(item.id, cond)}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                  item.condition === cond
                                    ? cond === 'GOOD'
                                      ? 'bg-white text-emerald-700 shadow-sm'
                                      : cond === 'DAMAGED'
                                        ? 'bg-white text-red-700 shadow-sm'
                                        : 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                {cond === 'GOOD' ? 'Tốt' : cond === 'DAMAGED' ? 'Hư hỏng' : 'Mất'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <Input
                          placeholder="Ghi chú hiện trạng..."
                          value={item.note || ''}
                          onChange={(e) => updateItemNote(item.id, e.target.value)}
                          disabled={isCompleted}
                          className="bg-slate-50 pr-10"
                        />
                        <button
                          disabled={isCompleted}
                          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-blue-600"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Xác nhận bàn giao */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-lg">Xác nhận bàn giao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {/* Renter Signature */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Người thuê</p>
                  <Badge variant={handover.signedByRenterAt ? 'default' : 'secondary'} className="text-[10px]">
                    {handover.signedByRenterAt ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                </div>
                <div className="flex h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100">
                  {handover.signedByRenterAt ? (
                    <div className="text-center">
                      <p className="font-['Caveat'] text-4xl text-blue-900">Signed Renter</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(handover.signedByRenterAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <FileSignature className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      <p className="text-sm font-medium">Nhấn để ký tên</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-sm font-medium text-slate-700">Người thuê phòng</p>
              </div>

              {/* Staff Signature */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Nhân viên</p>
                  <Badge
                    variant={handover.signedByLandlordAt ? 'default' : 'secondary'}
                    className="bg-emerald-100 text-[10px] text-emerald-800 hover:bg-emerald-200"
                  >
                    {handover.signedByLandlordAt ? 'Đã ký' : 'Chưa ký'}
                  </Badge>
                </div>
                <div className="relative flex h-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  {handover.signedByLandlordAt ? (
                    <div className="text-center">
                      <p className="font-['Caveat'] text-4xl text-blue-900">System Admin</p>
                      <CheckCircle className="absolute right-2 bottom-2 h-5 w-5 rounded-full bg-white text-emerald-600" />
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer text-center text-slate-400 hover:text-slate-600"
                      onClick={() => toast.success('Đã mô phỏng ký tên nhân viên thành công!')}
                    >
                      <FileSignature className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      <p className="text-sm font-medium">Nhấn để ký xác nhận</p>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-sm font-medium text-slate-700">Đại diện quản lý</p>
              </div>
            </CardContent>
          </Card>

          {/* Ghi chú chung */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-lg">Ghi chú chung</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                placeholder="Nhập các ghi chú khác về tình trạng phòng..."
                className="min-h-[120px] resize-none bg-slate-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
