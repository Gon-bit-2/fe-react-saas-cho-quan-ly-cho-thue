import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle, AlertTriangle, Calculator, CalendarDays } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface TerminationRequestProps {
  contractId: number
  isLandlord: boolean
  status?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  // More props would be added for actual integration
}

export function TerminationRequest({ isLandlord, status = 'NONE' }: TerminationRequestProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Giả lập trạng thái quy trình thanh lý
  const steps = [
    { id: 1, title: 'Gửi yêu cầu', status: status !== 'NONE' ? 'COMPLETED' : 'PENDING' },
    { id: 2, title: 'Xác nhận yêu cầu', status: status === 'REQUESTED' ? 'IN_PROGRESS' : status === 'APPROVED' || status === 'COMPLETED' ? 'COMPLETED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING' },
    { id: 3, title: 'Bàn giao & Quyết toán', status: status === 'APPROVED' ? 'IN_PROGRESS' : status === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
    { id: 4, title: 'Kết thúc hợp đồng', status: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING' },
  ]

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Đã gửi yêu cầu kết thúc hợp đồng. Tính năng đang trong quá trình tích hợp API.')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {status === 'NONE' ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Yêu cầu kết thúc hợp đồng trước hạn
            </CardTitle>
            <CardDescription>
              Khi kết thúc hợp đồng trước hạn, bạn có thể bị mất một phần hoặc toàn bộ tiền cọc theo điều khoản hợp đồng.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lý do kết thúc ({isLandlord ? 'Chủ trọ' : 'Người thuê'})
              </label>
              <Textarea 
                placeholder="Nhập lý do chi tiết..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-start gap-3 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold mb-1">Lưu ý quyết toán</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>Tiền cọc có thể bị cấn trừ vào các khoản phí chưa thanh toán.</li>
                  <li>Nếu vi phạm thời gian báo trước, bạn sẽ bị phạt theo hợp đồng.</li>
                  <li>Cần hoàn thành biên bản bàn giao phòng trước khi thanh lý hợp đồng.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button 
                variant="destructive" 
                onClick={handleSubmit} 
                disabled={!reason.trim() || isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu thanh lý'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-slate-800">Tiến trình thanh lý hợp đồng</CardTitle>
                    <CardDescription>Yêu cầu đang được xử lý</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Đang xử lý
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {/* Stepper */}
                <div className="relative">
                  <div className="absolute top-5 left-6 bottom-5 w-0.5 bg-slate-100"></div>
                  <div className="space-y-8 relative z-10">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-4">
                        <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                          step.status === 'COMPLETED' ? 'bg-emerald-500 text-white' :
                          step.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white' :
                          step.status === 'REJECTED' ? 'bg-red-500 text-white' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {step.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : 
                           step.status === 'REJECTED' ? <XCircle className="w-5 h-5" /> :
                           step.status === 'IN_PROGRESS' ? <Clock className="w-5 h-5" /> : 
                           <span>{step.id}</span>}
                        </div>
                        <div className="pt-2">
                          <h4 className={`font-semibold ${step.status !== 'PENDING' ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title}
                          </h4>
                          {step.status === 'COMPLETED' && idx === 0 && (
                            <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100">
                              <p><span className="font-medium">Người yêu cầu:</span> Nguyễn Văn A (Người thuê)</p>
                              <p><span className="font-medium">Lý do:</span> Chuyển công tác đột xuất</p>
                              <p className="text-xs text-slate-400 mt-1">10:30, 15/08/2026</p>
                            </div>
                          )}
                          {step.status === 'IN_PROGRESS' && idx === 1 && isLandlord && (
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Duyệt yêu cầu</Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Từ chối</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-slate-500" />
                  Dự tính quyết toán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Tiền cọc ban đầu</span>
                  <span className="font-medium">3,000,000 ₫</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Phạt vi phạm HĐ</span>
                  <span className="text-red-600 font-medium">- 1,500,000 ₫</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-500">Hóa đơn chưa thanh toán</span>
                  <span className="text-red-600 font-medium">- 500,000 ₫</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-slate-900">Tiền cọc hoàn lại</span>
                  <span className="text-lg font-bold text-emerald-600">1,000,000 ₫</span>
                </div>
                
                <div className="mt-6 bg-blue-50 text-blue-800 p-3 rounded-md text-xs border border-blue-100 flex items-start gap-2">
                  <CalendarDays className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Số tiền thực tế có thể thay đổi sau khi kiểm kê tài sản (nếu có hỏng hóc) và chốt chỉ số điện nước cuối cùng.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
