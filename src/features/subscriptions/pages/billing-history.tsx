import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { PAYMENT_STATUS_MAP } from '@/shared/constants/status-config';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { CreditCard, FileText, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';
import { planApi } from '../api/plan.api';
import { useAuth } from '@/shared/hooks/use-auth';

/**
 * Trang xem lịch sử thanh toán hóa đơn các gói cước dịch vụ SaaS
 * Liệt kê toàn bộ giao dịch mua/gia hạn gói cước, mã giao dịch và trạng thái thanh toán
 */
export const BillingHistoryPage = () => {
  const { selectedMembership } = useAuth();
  const tenantId = Number(selectedMembership?.tenantId || 0);

  /**
   * Tải lịch sử giao dịch mua gói từ server bằng React Query
   */
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['subscription-payments', tenantId],
    queryFn: () => planApi.getPaymentHistory(tenantId),
    enabled: !!tenantId,
  });

  const transactions = response?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch Sử Mua Gói Cước</h1>
          <p className="text-xs text-slate-500 mt-1">
            Xem lại các khoản thanh toán gói dịch vụ SaaS và tải biên nhận điện tử.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Xuất hóa đơn
          </Button>
        </div>
      </div>

      {/* Bảng dữ liệu lịch sử thanh toán */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[140px]">Ngày Thanh Toán</TableHead>
                <TableHead>Mã Đăng Ký</TableHead>
                <TableHead className="text-right">Số Tiền</TableHead>
                <TableHead>Mã Tham Chiếu</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right w-[100px]">Biên Lai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={CreditCard}
                      title="Chưa có lịch sử giao dịch"
                      description="Hiện tại bạn chưa phát sinh hóa đơn mua gói dịch vụ SaaS nào."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-700">
                      {formatDate(tx.createdAt)}
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-xs text-slate-900">
                        Đăng ký gói #{tx.subscriptionId}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-bold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(tx.amount)}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {tx.transactionId || 'Chưa có'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={tx.status}
                        configMap={PAYMENT_STATUS_MAP}
                        size="sm"
                      />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-slate-500 hover:text-blue-600 gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số {transactions.length} giao dịch ghi nhận</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold px-2 py-1 bg-slate-100 rounded text-slate-700">1</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
