import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, HelpCircle, FileText, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PaymentTransaction } from '../api/plan.api';

// Mock data based on the design
const mockTransactions: PaymentTransaction[] = [
  {
    id: 1,
    tenantId: 1,
    subscriptionId: 1,
    amount: 11880000,
    currency: 'VND',
    status: 'SUCCESS',
    paymentMethod: 'PAYOS',
    transactionId: 'TXN-552-SUB',
    createdAt: '2023-10-01T08:00:00Z',
    updatedAt: '2023-10-01T08:05:00Z'
  },
  {
    id: 2,
    tenantId: 1,
    subscriptionId: 1,
    amount: 11880000,
    currency: 'VND',
    status: 'SUCCESS',
    paymentMethod: 'PAYOS',
    transactionId: 'TXN-421-SUB',
    createdAt: '2022-10-01T08:00:00Z',
    updatedAt: '2022-10-01T08:05:00Z'
  },
  {
    id: 3,
    tenantId: 1,
    subscriptionId: 1,
    amount: 5400000,
    currency: 'VND',
    status: 'SUCCESS',
    paymentMethod: 'PAYOS',
    transactionId: 'TXN-105-SUB',
    createdAt: '2021-10-01T08:00:00Z',
    updatedAt: '2021-10-01T08:05:00Z'
  }
];

export const BillingHistoryPage = () => {
  const [transactions] = useState<PaymentTransaction[]>(mockTransactions);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Lịch sử thanh toán</h1>
            <p className="text-sm text-muted-foreground">Xem và tải xuống các khoản thanh toán gói và hóa đơn trước đây của bạn.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất tất cả
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Ngày thanh toán</TableHead>
                  <TableHead className="font-semibold">Gói dịch vụ</TableHead>
                  <TableHead className="font-semibold text-right">Số tiền (VND)</TableHead>
                  <TableHead className="font-semibold">Mã giao dịch</TableHead>
                  <TableHead className="font-semibold">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={tx.id} className="group hover:bg-muted/30 transition-colors cursor-default">
                    <TableCell className="font-medium tabular-nums">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${index < 2 ? 'bg-primary' : 'bg-muted-foreground'}`}></span>
                        <span className="font-medium">{index < 2 ? 'Professional' : 'Starter'}</span>
                        <span className="text-xs text-muted-foreground">(Hàng năm)</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{tx.transactionId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Thành công
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 ml-auto text-muted-foreground hover:text-primary">
                        <span className="text-xs font-medium">PDF</span>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between text-sm text-muted-foreground">
            <span>Hiển thị {transactions.length} trên {transactions.length} giao dịch</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="default" size="icon" className="w-8 h-8 rounded">
                1
              </Button>
              <Button variant="outline" size="icon" className="w-8 h-8 rounded" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Support Banner */}
        <div className="flex flex-col md:flex-row gap-6 bg-muted/50 p-6 rounded-xl border border-border items-start md:items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">Cần hỗ trợ về hóa đơn?</h3>
            <p className="text-sm text-muted-foreground">Nếu bạn nhận thấy bất kỳ sự khác biệt nào hoặc cần cập nhật chi tiết thanh toán trên hóa đơn trước đây, vui lòng liên hệ với nhóm hỗ trợ của chúng tôi.</p>
          </div>
          <Button variant="outline" className="whitespace-nowrap w-full md:w-auto bg-card">
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>
    </div>
  );
};
