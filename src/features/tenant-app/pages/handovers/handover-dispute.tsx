import { useParams, useNavigate } from 'react-router'
import { useState } from 'react'
import { useHandover, useResolveHandover } from '@/shared/api/handovers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { HANDOVER_STATUS_MAP, ASSET_CONDITION_MAP } from '@/shared/constants/status-config'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function HandoverDispute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: handover, isLoading } = useHandover(Number(id))
  const resolveHandover = useResolveHandover(Number(id))

  const [resolutionNote, setResolutionNote] = useState('')

  if (isLoading) return <div className="p-10 text-center">Đang tải...</div>
  if (!handover) return <div className="p-10 text-center">Không tìm thấy biên bản bàn giao</div>
  if (handover.status !== 'DISPUTED') {
    return (
      <div className="space-y-4 p-10 text-center">
        <p>Biên bản này không trong trạng thái tranh chấp.</p>
        <Button onClick={() => navigate(`/ban-giao/${id}`)}>Quay lại Chi tiết Bàn giao</Button>
      </div>
    )
  }

  const handleResolve = () => {
    if (!resolutionNote.trim()) {
      toast.error('Vui lòng nhập ghi chú/kết quả xử lý tranh chấp')
      return
    }

    resolveHandover.mutate(
      {
        version: handover.version,
        resolutionNote,
      },
      {
        onSuccess: () => {
          toast.success('Đã giải quyết tranh chấp thành công!')
          navigate(`/ban-giao/${id}`)
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi giải quyết tranh chấp')
        },
      },
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Xử lý Tranh chấp Bàn giao</h1>
          <p className="mt-1 text-sm text-slate-500">
            Mã biên bản: #{handover.id} • Hợp đồng #{handover.contractId}
          </p>
        </div>
        <StatusBadge status="DISPUTED" statusMap={HANDOVER_STATUS_MAP} fallbackLabel="Đang tranh chấp" className="h-8 px-3" />
      </div>

      <Card className="border-red-100 shadow-sm">
        <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-red-800">
            Nội dung tranh chấp / khiếu nại
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700 italic">
            "{handover.note || 'Không có ghi chú khiếu nại cụ thể từ người thuê.'}"
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-slate-900">Chi tiết tài sản trong biên bản này:</h4>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {handover.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-800">{item.assetName}</span>
                    <span className="ml-2 text-slate-500">(SL: {item.expectedQuantity})</span>
                  </div>
                  <div>
                    Tình trạng:{' '}
                    <StatusBadge status={item.condition} statusMap={ASSET_CONDITION_MAP} fallbackLabel={item.condition} className="font-medium shadow-none border-none bg-transparent hover:bg-transparent" />
                  </div>
                </div>
              ))}
              {handover.items.length === 0 && (
                <div className="p-3 text-center text-sm text-slate-500">Không có tài sản nào được ghi nhận.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg">Phương án Giải quyết</CardTitle>
          <CardDescription>
            Sau khi thương lượng và xử lý với khách thuê, vui lòng ghi nhận lại kết quả.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="resolutionNote">
              Biên bản xử lý / Kết luận <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="resolutionNote"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Ví dụ: Khách thuê đồng ý đền bù 500,000đ cho chiếc Tivi bị xước màn hình..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3 border-t border-slate-50 pt-4">
          <Button variant="outline" onClick={() => navigate(`/ban-giao/${id}`)}>
            <XCircle className="mr-2 h-4 w-4" /> Hủy bỏ
          </Button>
          <Button
            onClick={handleResolve}
            disabled={!resolutionNote.trim() || resolveHandover.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Khép lại tranh chấp
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
