import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, Download, Trash2, Sofa, Tv, PenTool } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import SignatureCanvas from 'react-signature-canvas'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface AssetHandoverProps {
  contractId: number
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

export function AssetHandover({ isLandlord, status = 'DRAFT' }: AssetHandoverProps) {
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: 1, name: 'Tủ lạnh Casper 180L', quantity: 1, condition: 'GOOD', note: '', icon: Tv },
    { id: 2, name: 'Điều hòa Daikin 9000BTU', quantity: 1, condition: 'GOOD', note: 'Chưa vệ sinh lưới lọc', icon: Tv },
    { id: 3, name: 'Giường gỗ 1m6', quantity: 1, condition: null, note: '', icon: Sofa },
    { id: 4, name: 'Bàn ghế làm việc', quantity: 1, condition: 'DAMAGED', note: 'Trầy xước nhẹ ở góc', icon: Sofa },
  ])
  
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const sigPadRef = useRef<SignatureCanvas>(null)

  const handleConditionChange = (id: number, condition: AssetItem['condition']) => {
    setAssets(assets.map(a => a.id === id ? { ...a, condition } : a))
  }

  const handleNoteChange = (id: number, note: string) => {
    setAssets(assets.map(a => a.id === id ? { ...a, note } : a))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Biên bản bàn giao tài sản</h2>
          <p className="text-sm text-slate-500">
            {status === 'DRAFT' ? 'Đang thực hiện kiểm kê' : 'Đã xác nhận bàn giao'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status === 'DRAFT' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}>
            {status === 'DRAFT' ? 'Bản nháp' : 'Đã hoàn tất'}
          </Badge>
          {status === 'CONFIRMED' && (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Xuất PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assets.map((asset) => {
            const Icon = asset.icon
            return (
              <Card key={asset.id} className="border-slate-200 shadow-sm overflow-hidden">
                <div className={`h-1 w-full ${
                  asset.condition === 'GOOD' ? 'bg-emerald-500' : 
                  asset.condition === 'DAMAGED' ? 'bg-amber-500' : 
                  asset.condition === 'LOST' ? 'bg-red-500' : 'bg-slate-200'
                }`}></div>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{asset.name}</p>
                        <p className="text-sm text-slate-500">Số lượng: {asset.quantity}</p>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto min-w-[140px]">
                      {status === 'CONFIRMED' ? (
                        <Badge variant="outline" className={`w-full justify-center ${
                          asset.condition === 'GOOD' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                          asset.condition === 'DAMAGED' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                          'border-red-200 text-red-700 bg-red-50'
                        }`}>
                          {asset.condition === 'GOOD' ? 'Tốt' : asset.condition === 'DAMAGED' ? 'Hư hỏng' : 'Thất lạc'}
                        </Badge>
                      ) : (
                        <Select value={asset.condition || ''} onValueChange={(v) => handleConditionChange(asset.id, v)}>
                          <SelectTrigger className="w-full h-9">
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
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100">
                      {status === 'CONFIRMED' ? (
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-800">Ghi chú:</span> {asset.note || 'Không có ghi chú'}</p>
                      ) : (
                        <Textarea 
                          placeholder="Ghi chú thêm về tình trạng hư hỏng..." 
                          value={asset.note}
                          onChange={(e) => handleNoteChange(asset.id, e.target.value)}
                          className="min-h-[60px] text-sm resize-none"
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Xác nhận bàn giao
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản bình thường</span>
                  <span className="font-medium text-emerald-600">{assets.filter(a => a.condition === 'GOOD').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản hư hỏng</span>
                  <span className="font-medium text-amber-600">{assets.filter(a => a.condition === 'DAMAGED').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tài sản thất lạc</span>
                  <span className="font-medium text-red-600">{assets.filter(a => a.condition === 'LOST').length}</span>
                </div>
              </div>

              {status === 'DRAFT' && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs border border-blue-100">
                  Vui lòng kiểm tra kỹ tình trạng tài sản trước khi ký xác nhận. Tiền bồi thường (nếu có) sẽ được trừ vào tiền cọc.
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-3">Chữ ký xác nhận ({isLandlord ? 'Chủ trọ' : 'Người thuê'})</p>
                {signatureData ? (
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 relative group">
                    <img src={signatureData} alt="Signature" className="w-full h-24 object-contain" />
                    {status === 'DRAFT' && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSignatureData(null)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full h-20 border-dashed gap-2 text-slate-500"
                    onClick={() => setShowSignatureDialog(true)}
                  >
                    <PenTool className="w-5 h-5" /> Chạm để ký tên
                  </Button>
                )}
              </div>

              {status === 'DRAFT' && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!signatureData || assets.some(a => !a.condition)}>
                  Hoàn tất biên bản
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
          <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas 
              ref={sigPadRef}
              canvasProps={{
                className: 'w-full h-[200px] cursor-crosshair'
              }}
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
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
