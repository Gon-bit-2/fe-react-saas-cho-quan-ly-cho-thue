import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, Download, Trash2, Sofa, Tv, PenTool } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import SignatureCanvas from 'react-signature-canvas'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  handoversControllerCreate,
  handoversControllerUpdate,
  handoversControllerConfirm,
  handoversControllerConfirmMine,
  useHandoversControllerList,
  useHandoversControllerListMine,
} from '@/shared/api/generated/handovers/handovers'
import { useRoomAssetsControllerList } from '@/shared/api/generated/room-assets/room-assets'
import { useMutation } from '@tanstack/react-query'

interface AssetHandoverProps {
  contractId: number
  roomId?: number
  isLandlord: boolean
  status?: 'DRAFT' | 'CONFIRMED'
}

interface AssetItem {
  id: number
  name: string
  quantity: number
  condition: 'GOOD' | 'DAMAGED' | 'LOST' | null
  note: string
  icon: React.ElementType
}

export function AssetHandover({ contractId, roomId, isLandlord }: AssetHandoverProps) {
  const { mutateAsync: createHandover, isPending } = useMutation({
    mutationFn: (variables: Parameters<typeof handoversControllerCreate>[0]) => handoversControllerCreate(variables),
  })

  const { data: handoversResponseLandlord, refetch: refetchHandoversLandlord } = useHandoversControllerList(
    { contractId, limit: 10 },
    { query: { enabled: !!contractId && isLandlord } },
  )

  const { data: handoversResponseTenant, refetch: refetchHandoversTenant } = useHandoversControllerListMine(
    { contractId, limit: 10 },
    { query: { enabled: !!contractId && !isLandlord } },
  )

  const handoversResponse = isLandlord ? handoversResponseLandlord : handoversResponseTenant
  const refetchHandovers = isLandlord ? refetchHandoversLandlord : refetchHandoversTenant

  const { data: roomAssetsResponse } = useRoomAssetsControllerList(roomId!, undefined, {
    query: { enabled: !!roomId },
  })

  const [assets, setAssets] = useState<AssetItem[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handovers = (handoversResponse as any)?.data || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkinHandover = handovers.find((h: any) => h.type === 'CHECKIN')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkoutHandover = handovers.find((h: any) => h.type === 'CHECKOUT')

  const isCheckinConfirmed = checkinHandover?.status === 'CONFIRMED'

  // Quyết định loại biên bản đang xem/tạo
  const currentType = isCheckinConfirmed ? 'CHECKOUT' : 'CHECKIN'
  const currentHandover = currentType === 'CHECKOUT' ? checkoutHandover : checkinHandover

  // Xác định trạng thái chi tiết dựa trên chữ ký
  const hasLandlordSigned = !!currentHandover?.signedByLandlordAt
  const hasRenterSigned = !!currentHandover?.signedByRenterAt
  const isFullyConfirmed = currentHandover?.status === 'CONFIRMED'

  // Trạng thái hiển thị trên UI
  // DRAFT: chưa ai ký (hoặc landlord chưa ký)
  // WAITING_OTHER: mình đã ký, chờ người kia
  // CONFIRMED: cả 2 đã ký
  let status = 'DRAFT'
  if (isFullyConfirmed) {
    status = 'CONFIRMED'
  } else if (currentHandover) {
    if (isLandlord && hasLandlordSigned) {
      status = 'WAITING_OTHER' // Chờ người thuê
    } else if (!isLandlord && hasRenterSigned) {
      status = 'WAITING_OTHER' // Chờ chủ trọ (thường không xảy ra vì chủ trọ tạo)
    } else if (!isLandlord && hasLandlordSigned && !hasRenterSigned) {
      status = 'DRAFT' // Tới lượt người thuê ký
    }
  }

  useEffect(() => {
    // Nếu đã có biên bản (và có items), hiển thị từ biên bản
    if (currentHandover && currentHandover.assetItems && currentHandover.assetItems.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssets(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentHandover.assetItems.map((item: any) => ({
          id: item.roomAssetId,
          name: item.roomAsset?.name || 'Tài sản',
          quantity: item.actualQuantity || 1,
          condition: item.condition || 'GOOD',
          note: item.note || '',
          icon:
            (item.roomAsset?.name || '').toLowerCase().includes('giường') ||
            (item.roomAsset?.name || '').toLowerCase().includes('sofa')
              ? Sofa
              : Tv,
        })),
      )
    } else if (roomAssetsResponse) {
      // Nếu chưa có biên bản, lấy danh sách tài sản phòng mặc định
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = Array.isArray(roomAssetsResponse) ? roomAssetsResponse : (roomAssetsResponse as any).data || []
      setAssets(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity || 1,
          condition: 'GOOD',
          note: item.description || '',
          icon: item.name.toLowerCase().includes('giường') || item.name.toLowerCase().includes('sofa') ? Sofa : Tv,
        })),
      )
    }
  }, [currentHandover, roomAssetsResponse])

  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const sigPadRef = useRef<SignatureCanvas>(null)

  const handleConditionChange = (id: number, condition: AssetItem['condition']) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, condition } : a)))
  }

  const handleNoteChange = (id: number, note: string) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, note } : a)))
  }

  const clearSignature = () => {
    sigPadRef.current?.clear()
  }

  const saveSignature = () => {
    try {
      if (sigPadRef.current?.isEmpty()) {
        alert('Vui lòng ký trước khi lưu')
        return
      }
      // Use getCanvas() instead of getTrimmedCanvas() to avoid crashing on some environments
      const data = sigPadRef.current?.getCanvas().toDataURL('image/png')
      if (data) {
        setSignatureData(data)
        setShowSignatureDialog(false)
      }
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Có lỗi xảy ra khi lưu chữ ký. Vui lòng thử lại.')
    }
  }

  const handleComplete = async () => {
    try {
      if (!isLandlord) {
        if (!currentHandover) {
          toast.error('Chưa có biên bản bàn giao từ chủ trọ để xác nhận.')
          return
        }
        await handoversControllerConfirmMine(currentHandover.id, { version: currentHandover.version })
        toast.success(`Đã ký xác nhận biên bản ${currentType === 'CHECKIN' ? 'nhận' : 'trả'} phòng thành công!`)
        refetchHandovers()
        return
      }

      // Landlord flow
      const itemsPayload = assets.map((a) => ({
        roomAssetId: a.id,
        actualQuantity: a.quantity,
        condition: a.condition as NonNullable<AssetItem['condition']>,
        note: a.note || null,
      }))

      let handoverVersion = 1
      let handoverId = 0

      if (!currentHandover) {
        // Chưa có biên bản (chưa có DRAFT), tạo mới
        const res = await createHandover({
          contractId,
          type: currentType as 'CHECKIN' | 'CHECKOUT',
          items: itemsPayload,
        })
        handoverId = (res as { id: number }).id
        handoverVersion = (res as { version: number }).version
      } else {
        // Đã có biên bản DRAFT, update items trước
        handoverId = currentHandover.id
        const res = await handoversControllerUpdate(handoverId, {
          version: currentHandover.version,
          items: itemsPayload,
        })
        handoverVersion = (res as { version: number }).version
      }

      // Ký xác nhận
      await handoversControllerConfirm(handoverId, { version: handoverVersion })

      toast.success(`Đã lưu và xác nhận biên bản ${currentType === 'CHECKIN' ? 'nhận' : 'trả'} phòng thành công!`)
      refetchHandovers()
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } }
      console.error(err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu biên bản')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Biên bản {currentType === 'CHECKIN' ? 'nhận phòng (CHECKIN)' : 'trả phòng (CHECKOUT)'}
          </h2>
          <p className="text-sm text-slate-500">
            {status === 'DRAFT'
              ? 'Đang thực hiện kiểm kê'
              : status === 'WAITING_OTHER'
                ? 'Đang chờ người kia ký'
                : 'Đã xác nhận bàn giao'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={
              status === 'DRAFT'
                ? 'bg-amber-100 text-amber-800'
                : status === 'WAITING_OTHER'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
            }
          >
            {status === 'DRAFT' ? 'Bản nháp' : status === 'WAITING_OTHER' ? 'Chờ xác nhận' : 'Đã hoàn tất'}
          </Badge>
          {status === 'CONFIRMED' && (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Xuất PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {assets.map((asset) => {
            const Icon = asset.icon
            return (
              <Card key={asset.id} className="overflow-hidden border-slate-200 shadow-sm">
                <div
                  className={`h-1 w-full ${
                    asset.condition === 'GOOD'
                      ? 'bg-emerald-500'
                      : asset.condition === 'DAMAGED'
                        ? 'bg-amber-500'
                        : asset.condition === 'LOST'
                          ? 'bg-red-500'
                          : 'bg-slate-200'
                  }`}
                ></div>
                <CardContent className="p-5">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{asset.name}</p>
                        <p className="text-sm text-slate-500">Số lượng: {asset.quantity}</p>
                      </div>
                    </div>

                    <div className="w-full min-w-[140px] sm:w-auto">
                      {status === 'CONFIRMED' || !isLandlord ? (
                        <Badge
                          variant="outline"
                          className={`w-full justify-center ${
                            asset.condition === 'GOOD'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : asset.condition === 'DAMAGED'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {asset.condition === 'GOOD' ? 'Tốt' : asset.condition === 'DAMAGED' ? 'Hư hỏng' : 'Thất lạc'}
                        </Badge>
                      ) : (
                        <Select
                          value={asset.condition || ''}
                          onValueChange={(v) => handleConditionChange(asset.id, v as AssetItem['condition'])}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Tình trạng" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GOOD">Bình thường</SelectItem>
                            <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
                            <SelectItem value="LOST">Thất lạc</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {(asset.condition === 'DAMAGED' || asset.condition === 'LOST' || asset.note) && (
                    <div className="mt-4 border-t border-dashed border-slate-100 pt-3">
                      {status === 'CONFIRMED' || !isLandlord ? (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-800">Ghi chú:</span>{' '}
                          {asset.note || 'Không có ghi chú'}
                        </p>
                      ) : (
                        <Textarea
                          placeholder="Ghi chú thêm về tình trạng hư hỏng..."
                          value={asset.note}
                          onChange={(e) => handleNoteChange(asset.id, e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Xác nhận bàn giao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản bình thường</span>
                  <span className="font-medium text-emerald-600">
                    {assets.filter((a) => a.condition === 'GOOD').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản hư hỏng</span>
                  <span className="font-medium text-amber-600">
                    {assets.filter((a) => a.condition === 'DAMAGED').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản thất lạc</span>
                  <span className="font-medium text-red-600">
                    {assets.filter((a) => a.condition === 'LOST').length}
                  </span>
                </div>
              </div>

              {status === 'DRAFT' && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                  Vui lòng kiểm tra kỹ tình trạng tài sản trước khi ký xác nhận. Tiền bồi thường (nếu có) sẽ được trừ
                  vào tiền cọc.
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Chữ ký xác nhận ({isLandlord ? 'Chủ trọ' : 'Người thuê'})
                </p>
                {signatureData ? (
                  <div className="group relative rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <img src={signatureData} alt="Signature" className="h-24 w-full object-contain" />
                    {status === 'DRAFT' && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setSignatureData(null)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="h-20 w-full gap-2 border-dashed text-slate-500"
                    onClick={() => setShowSignatureDialog(true)}
                  >
                    <PenTool className="h-5 w-5" /> Chạm để ký tên
                  </Button>
                )}
              </div>

              {status === 'DRAFT' && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!signatureData || assets.some((a) => !a.condition) || isPending}
                  onClick={handleComplete}
                >
                  {isPending ? 'Đang lưu...' : 'Hoàn tất biên bản'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ký xác nhận bàn giao</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border-2 border-slate-200 bg-white">
            <SignatureCanvas
              ref={sigPadRef}
              canvasProps={{
                className: 'w-full h-[200px] cursor-crosshair',
              }}
            />
          </div>
          <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
            <Button variant="ghost" onClick={clearSignature} className="text-slate-500">
              Ký lại
            </Button>
            <Button onClick={saveSignature} className="bg-blue-600 hover:bg-blue-700">
              Lưu chữ ký
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
