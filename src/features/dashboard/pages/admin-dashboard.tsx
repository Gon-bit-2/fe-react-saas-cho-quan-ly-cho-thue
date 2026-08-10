import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Building2, Building, Megaphone, TrendingUp, TrendingDown, 
  Calendar, Download, AlertTriangle, UserPlus, CreditCard, ArrowUp
} from 'lucide-react';

export const AdminDashboardPage = () => {
  return (
    <div className="flex flex-col w-full min-h-screen pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng quan nền tảng</h1>
          <p className="text-lg text-muted-foreground mt-1">Các chỉ số tổng quan và hoạt động gần đây của hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            30 ngày qua
          </Button>
          <Button className="flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 font-medium bg-green-100 text-green-800">
                <TrendingUp className="w-3 h-3" /> +12%
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Tổng người dùng</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">24,592</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 font-medium bg-green-100 text-green-800">
                <TrendingUp className="w-3 h-3" /> +8%
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Chủ trọ hoạt động</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">1,204</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Building className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 font-medium bg-green-100 text-green-800">
                <TrendingUp className="w-3 h-3" /> +15%
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Tổng tòa nhà</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">8,430</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Megaphone className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 font-medium bg-red-100 text-red-800 hover:bg-red-100">
                <TrendingDown className="w-3 h-3" /> -2%
              </Badge>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Tin đăng active</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">4,215</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* User Growth Chart (Placeholder) */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Biểu đồ tăng trưởng</h2>
                <p className="text-sm text-muted-foreground mt-1">Người thuê mới vs Chủ trọ mới (30 ngày qua)</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-muted-foreground">Người thuê</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-muted-foreground">Chủ trọ</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative min-h-[300px] w-full">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path className="text-blue-500" d="M0,80 Q25,70 50,85 T100,60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path className="text-primary" d="M0,50 Q25,30 50,60 T100,20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path className="text-primary/10" d="M0,50 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="currentColor"></path>
                <path className="text-blue-500/10" d="M0,80 Q25,70 50,85 T100,60 L100,100 L0,100 Z" fill="currentColor"></path>
                
                <line className="text-border" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25"></line>
                <line className="text-border" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50"></line>
                <line className="text-border" stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="75" y2="75"></line>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart (Placeholder) */}
        <Card>
          <CardContent className="p-6 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground">Doanh thu gói dịch vụ</h2>
              <p className="text-sm text-muted-foreground mt-1">Doanh thu định kỳ hàng tháng</p>
            </div>
            <div className="mb-6">
              <p className="text-3xl font-bold text-foreground tabular-nums">142.5M <span className="text-lg text-muted-foreground font-normal">VND</span></p>
              <p className="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                <ArrowUp className="w-4 h-4" />
                +5.2% so với tháng trước
              </p>
            </div>
            
            <div className="flex-1 relative flex items-end gap-2 mt-4 min-h-[150px]">
              <div className="w-full bg-muted rounded-t-sm h-[40%] hover:bg-primary/50 transition-colors cursor-pointer group relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">82M VND</div>
              </div>
              <div className="w-full bg-muted rounded-t-sm h-[55%] hover:bg-primary/50 transition-colors cursor-pointer group relative"></div>
              <div className="w-full bg-muted rounded-t-sm h-[45%] hover:bg-primary/50 transition-colors cursor-pointer group relative"></div>
              <div className="w-full bg-muted rounded-t-sm h-[70%] hover:bg-primary/50 transition-colors cursor-pointer group relative"></div>
              <div className="w-full bg-muted rounded-t-sm h-[65%] hover:bg-primary/50 transition-colors cursor-pointer group relative"></div>
              <div className="w-full bg-primary rounded-t-sm h-[85%] hover:bg-primary/80 transition-colors cursor-pointer group relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">142.5M VND</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground">
              <span>Th 1</span>
              <span>Th 2</span>
              <span>Th 3</span>
              <span>Th 4</span>
              <span>Th 5</span>
              <span>Th 6</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6 pb-0 flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Hoạt động gần đây</h2>
          <Button variant="link" className="text-primary hover:text-primary/80 h-auto p-0">Xem tất cả</Button>
        </div>
        <div className="overflow-x-auto border-t border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Hoạt động</TableHead>
                <TableHead className="font-semibold">Người dùng</TableHead>
                <TableHead className="font-semibold">Thời gian</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Báo cáo tin đăng (Scam)</p>
                      <p className="text-xs text-muted-foreground">Mã tin: #PROP-8821</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-muted-foreground">Ẩn danh</TableCell>
                <TableCell className="text-muted-foreground">2 phút trước</TableCell>
                <TableCell>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1"></span>
                    Ưu tiên cao
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm">Kiểm duyệt</Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Chủ trọ mới đăng ký</p>
                      <p className="text-xs text-muted-foreground">Chờ xác thực KYC</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">Minh Trần</TableCell>
                <TableCell className="text-muted-foreground">15 phút trước</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                    Chờ duyệt
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm">Xác thực</Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Nâng cấp gói dịch vụ</p>
                      <p className="text-xs text-muted-foreground">Gói Pro Hàng năm</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">Green City Estates</TableCell>
                <TableCell className="text-muted-foreground">1 giờ trước</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1"></span>
                    Hoàn thành
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm">Chi tiết</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
