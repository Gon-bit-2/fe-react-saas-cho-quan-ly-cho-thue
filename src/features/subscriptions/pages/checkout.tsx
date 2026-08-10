import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Copy, ArrowLeft, Download, Timer, Lock, Verified } from 'lucide-react';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59); // 14:59

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-64px)] bg-background pb-12 px-4 md:px-8 lg:items-center lg:justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 mt-8 lg:mt-0">
        
        {/* Order Summary Column */}
        <div className="flex flex-col w-full lg:w-5/12 gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors w-fit mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại chọn gói</span>
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Thanh toán</h1>
            <p className="text-sm text-muted-foreground">Kiểm tra thông tin đăng ký và tiến hành thanh toán an toàn.</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col gap-6 mt-4 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Gói đã chọn</span>
                <span className="text-xl font-bold text-foreground">Professional</span>
              </div>
              <div className="px-3 py-1 bg-primary/10 rounded-full flex items-center gap-1.5">
                <Verified className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Thanh toán hàng năm</span>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-border relative z-10"></div>
            
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Giá gốc</span>
                <span className="text-sm text-foreground font-medium tabular-nums">990,000 VND / tháng</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chu kỳ</span>
                <span className="text-sm text-foreground font-medium">12 tháng</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm font-medium">Giảm giá năm (20%)</span>
                <span className="text-sm font-medium tabular-nums">- 2,970,000 VND</span>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-border relative z-10"></div>
            
            <div className="flex justify-between items-end relative z-10">
              <span className="text-base font-semibold text-foreground">Tổng thanh toán</span>
              <span className="text-3xl font-bold text-primary tabular-nums">
                11,880,000 <span className="text-xl font-semibold text-muted-foreground ml-1">VND</span>
              </span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Thanh toán được bảo mật an toàn bởi hệ thống PayOS. Dữ liệu của bạn được mã hóa.</p>
          </div>
        </div>

        {/* Payment QR Column */}
        <div className="flex flex-col w-full lg:w-7/12 mt-8 lg:mt-0 lg:pl-8 xl:pl-16 relative">
          <div className="hidden lg:block absolute top-1/2 -left-12 w-24 h-[2px] bg-gradient-to-r from-border to-primary/30 -z-10 transform -translate-y-1/2"></div>
          <div className="hidden lg:block absolute top-1/2 -left-[42px] w-3 h-3 rounded-full bg-background border-2 border-primary -z-10 transform -translate-y-1/2"></div>
          
          <div className="bg-card rounded-2xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden border border-border">
            
            {/* Status Banner */}
            <div className="w-full bg-amber-50 dark:bg-amber-950/30 py-3 px-4 rounded-xl flex items-center justify-between mb-8 border border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-500">Đang chờ thanh toán...</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border">
                <Timer className="w-4 h-4 text-amber-600" />
                <span className={`text-sm font-bold tabular-nums ${timeLeft === 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {timeString}
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Quét mã QR bằng ứng dụng ngân hàng</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">Mở ứng dụng ngân hàng của bạn, chọn tính năng quét mã QR và quét mã bên dưới để hoàn tất giao dịch.</p>
            
            {/* QR Code Area */}
            <div className="relative group cursor-pointer mb-8">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-background to-primary/10 rounded-3xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-md border border-border flex flex-col items-center">
                
                {/* Fake QR */}
                <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden p-2">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payos-demo-payment" alt="QR Code" className="w-full h-full mix-blend-multiply relative z-10 opacity-80" />
                  
                  {/* Scanning animation line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_8px_2px_rgba(0,74,198,0.5)] animate-[scan_3s_ease-in-out_infinite]"></div>
                  
                  {/* Center logo overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-border">
                      <span className="text-primary font-bold">VNPAY</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Cung cấp bởi</span>
                  <span className="text-lg font-bold text-primary tracking-tighter italic">PayOS</span>
                </div>
              </div>
            </div>
            
            {/* Manual Transfer Details */}
            <div className="w-full flex flex-col gap-3 text-left bg-muted/50 p-4 rounded-xl border border-border mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin chuyển khoản</span>
                <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  <span className="text-xs font-medium">Sao chép tất cả</span>
                </button>
              </div>
              
              <div className="grid grid-cols-[100px_1fr_auto] gap-x-2 gap-y-3 items-center">
                <span className="text-xs font-medium text-muted-foreground">Ngân hàng</span>
                <span className="text-sm font-medium text-foreground truncate">Vietcombank</span>
                <div></div>
                
                <span className="text-xs font-medium text-muted-foreground">Số tài khoản</span>
                <span className="text-sm font-medium text-foreground tabular-nums">00110022334455</span>
                <button onClick={() => copyToClipboard('00110022334455')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"><Copy className="w-4 h-4" /></button>
                
                <span className="text-xs font-medium text-muted-foreground">Số tiền</span>
                <span className="text-sm font-medium text-foreground tabular-nums">11,880,000 VND</span>
                <button onClick={() => copyToClipboard('11880000')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"><Copy className="w-4 h-4" /></button>
                
                <span className="text-xs font-medium text-muted-foreground">Nội dung</span>
                <span className="text-sm font-medium text-foreground truncate bg-background px-2 py-1 rounded">SUB_HQ_9921</span>
                <button onClick={() => copyToClipboard('SUB_HQ_9921')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              <span>Tải xuống thông tin thanh toán</span>
            </Button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
