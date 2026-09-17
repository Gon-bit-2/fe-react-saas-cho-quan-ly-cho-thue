import { useParams, useNavigate } from 'react-router'
import { useRoomAssets } from '@/shared/api/assets'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/status-badge'
import { ASSET_CONDITION_MAP } from '@/shared/constants/status-config'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Loader2, Info } from 'lucide-react'

/**
 * Trang danh sách kiểm kê tài sản chi tiết theo phòng
 * Hiển thị toàn bộ trang thiết bị đang có trong phòng cùng tình trạng sử dụng
 */
export default function RoomAssets() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useRoomAssets(Number(roomId))

  const assets = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header section with back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tài sản trong phòng #{roomId}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bảng kiểm kê các thiết bị, đồ đạc và tình trạng vận hành của phòng
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">Danh sách thiết bị & đồ đạc</CardTitle>
            <CardDescription>Tổng số: {assets.length} trang thiết bị</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/quan-ly-phong/${roomId}`)}
          >
            <Info className="mr-2 h-4 w-4 text-blue-600" /> Đến chi tiết phòng
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm font-medium">Đang tải danh sách tài sản phòng...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">Phòng này chưa có tài sản nào</p>
              <p className="text-sm mt-1">
                Bạn có thể thêm tài sản vào phòng tại trang chi tiết phòng.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate(`/quan-ly-phong/${roomId}`)}
              >
                Vào trang quản lý phòng #{roomId}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Tên tài sản</TableHead>
                  <TableHead className="w-32 text-center font-semibold text-slate-600">Số lượng</TableHead>
                  <TableHead className="w-40 font-semibold text-slate-600">Tình trạng</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ghi chú kiểm tra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-700 tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.condition}
                        statusMap={ASSET_CONDITION_MAP}
                        fallbackLabel={item.condition}
                      />
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {item.description || <span className="text-slate-400 italic">Không có</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
