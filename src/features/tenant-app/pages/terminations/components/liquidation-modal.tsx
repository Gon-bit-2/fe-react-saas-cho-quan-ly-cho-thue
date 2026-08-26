import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Receipt, Zap, Hammer, Calculator, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useContract } from '@/shared/api/contracts'
import { useRoom } from '@/shared/api/properties'

interface LiquidationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: { actualMoveOutDate: string, electricityFee: number, waterFee: number, damageFee: number, penaltyFee: number, acknowledgeDebt: boolean }) => Promise<void>
  depositAmount: number
  contractId: string
  roomName: string
}

export function LiquidationModal({ isOpen, onClose, onComplete, depositAmount, contractId, roomName }: LiquidationModalProps) {
  const [electricityIndex, setElectricityIndex] = useState('')
  const [waterIndex, setWaterIndex] = useState('')
  const [damageFee, setDamageFee] = useState('')
  const [penaltyFee, setPenaltyFee] = useState('')
  const [acknowledgeDebt, setAcknowledgeDebt] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: contract, isLoading: isLoadingContract } = useContract(Number(contractId))
  const { data: room, isLoading: isLoadingRoom } = useRoom(Number(contract?.roomId))

  const [actualMoveOutDate, setActualMoveOutDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Lấy đơn giá từ phòng, nếu chưa có dữ liệu thì mặc định là 0
  const ELECTRICITY_PRICE = room?.electricityPrice || 0
  const WATER_PRICE = room?.waterPrice || 0

  const maxDateStr = contract?.endDate ? (() => {
    const today = new Date()
    const d = new Date(contract.endDate)
    d.setDate(d.getDate() - 1)
    return today < d ? today.toISOString().split('T')[0] : d.toISOString().split('T')[0]
  })() : new Date().toISOString().split('T')[0]

  const calculateTotal = () => {
    const eFee = (Number(electricityIndex) || 0) * ELECTRICITY_PRICE
    const wFee = (Number(waterIndex) || 0) * WATER_PRICE
    const dFee = Number(damageFee) || 0
    const pFee = Number(penaltyFee) || 0
    return {
      electricity: eFee,
      water: wFee,
      damage: dFee,
      penalty: pFee,
      totalDeduction: eFee + wFee + dFee + pFee,
      finalAmount: depositAmount - (eFee + wFee + dFee + pFee)
    }
  }

  const { electricity, water, damage, penalty, totalDeduction, finalAmount } = calculateTotal()

  const handleComplete = async () => {
    if (finalAmount < 0 && !acknowledgeDebt) {
      toast.error('Vui lòng tích chọn xác nhận công nợ do khách còn nợ tiền!')
      return
    }
    if (!actualMoveOutDate) {
      toast.error('Vui lòng chọn ngày trả phòng!')
      return
    }

    setIsSubmitting(true)
    try {
      await onComplete({ 
        actualMoveOutDate,
        electricityFee: electricity,
        waterFee: water,
        damageFee: damage,
        penaltyFee: penalty,
        acknowledgeDebt,
      })
      toast.success('Đã hoàn tất quyết toán và thanh lý hợp đồng!')
      onClose()
    } catch (error) {
      // Error is handled in onComplete or we can show generic
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5 text-blue-600" />
            Quyết Toán & Thanh Lý Hợp Đồng
          </DialogTitle>
          <DialogDescription>
            Tiến hành chốt điện nước, chi phí phát sinh và cấn trừ tiền cọc cho phòng <strong>{roomName}</strong> (HĐ: {contractId}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column: Form Inputs */}
          <div className="space-y-6">
            {(isLoadingContract || isLoadingRoom) && (
              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thông tin đơn giá điện nước...
              </div>
            )}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-slate-700">
                <Zap className="h-4 w-4 text-amber-500" /> Điện & Nước cuối kỳ
              </h4>
              <div className="grid gap-2">
                <Label htmlFor="moveOutDate">Ngày trả phòng</Label>
                <Input
                  id="moveOutDate"
                  type="date"
                  value={actualMoveOutDate}
                  onChange={(e) => setActualMoveOutDate(e.target.value)}
                  min={contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : undefined}
                  max={maxDateStr}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="electricity">Chỉ số điện chốt (Chữ)</Label>
                <Input
                  id="electricity"
                  type="number" min="0"
                  placeholder="Ví dụ: 150"
                  value={electricityIndex}
                  onChange={(e) => setElectricityIndex(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="water">Chỉ số nước chốt (Khối)</Label>
                <Input
                  id="water"
                  type="number" min="0"
                  placeholder="Ví dụ: 12"
                  value={waterIndex}
                  onChange={(e) => setWaterIndex(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-slate-700">
                <Hammer className="h-4 w-4 text-red-500" /> Chi phí hư hỏng & Phạt
              </h4>
              <div className="grid gap-2">
                <Label htmlFor="damage">Tiền bồi thường hư hỏng (VNĐ)</Label>
                <Input
                  id="damage"
                  type="number" min="0"
                  placeholder="0"
                  value={damageFee}
                  onChange={(e) => setDamageFee(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="penalty">Tiền phạt vi phạm hợp đồng (VNĐ)</Label>
                <Input
                  id="penalty"
                  type="number" min="0"
                  placeholder="0"
                  value={penaltyFee}
                  onChange={(e) => setPenaltyFee(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Preview Invoice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 h-full flex flex-col">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calculator className="h-5 w-5 text-indigo-500" /> Bản xem trước Hóa đơn
            </h4>
            
            <div className="flex-1 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Tiền cọc ban đầu:</span>
                <span className="font-semibold text-slate-900">{depositAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Các khoản khấu trừ</p>
                <div className="flex justify-between items-center text-red-600">
                  <span>Tiền điện cuối kỳ:</span>
                  <span>- {electricity.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Tiền nước cuối kỳ:</span>
                  <span>- {water.toLocaleString('vi-VN')} ₫</span>
                </div>
                {damage > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Đền bù hư hỏng:</span>
                    <span>- {damage.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {penalty > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Phạt vi phạm:</span>
                    <span>- {penalty.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3 font-semibold text-slate-700">
                <span>Tổng khấu trừ:</span>
                <span className="text-red-600">- {totalDeduction.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border mt-auto ${finalAmount >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${finalAmount >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                  {finalAmount >= 0 ? 'Chủ trọ hoàn lại:' : 'Khách phải đóng thêm:'}
                </span>
                <span className={`text-lg font-bold ${finalAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(finalAmount).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <p className={`text-xs ${finalAmount >= 0 ? 'text-emerald-600/80' : 'text-red-600/80'}`}>
                {finalAmount >= 0 
                  ? 'Hệ thống sẽ tạo hóa đơn với khoản dư này để bạn trả khách.'
                  : 'Tiền cọc không đủ bù chi phí. Cần tạo công nợ để thu thêm.'}
              </p>
            </div>

            {finalAmount < 0 && (
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="acknowledge"
                  className="rounded border-slate-300 mr-2 mt-0.5"
                  checked={acknowledgeDebt}
                  onChange={(e) => setAcknowledgeDebt(e.target.checked)}
                />
                <Label htmlFor="acknowledge" className="text-xs text-slate-600 leading-snug cursor-pointer">
                  Tôi xác nhận khách thuê vẫn còn công nợ <strong className="text-red-600">{Math.abs(finalAmount).toLocaleString('vi-VN')} ₫</strong> sau khi trừ cọc, và cho phép đóng hợp đồng.
                </Label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 pt-4 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button 
            onClick={handleComplete} 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-transparent animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Hoàn tất Quyết toán
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
