import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateInvoiceDto, InvoiceItemType, InvoiceStatus } from '../types';
import { createInvoice } from '../api';

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue } = useForm<CreateInvoiceDto>({
    defaultValues: {
      contractId: undefined,
      billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      status: InvoiceStatus.UNPAID,
      extraItems: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraItems"
  });

  // Mocked state for totals (would be calculated based on contract/readings in real app)
  const baseRent = 15000000;
  const electricity = 1225000;
  const water = 300000;
  const services = 850000;

  // eslint-disable-next-line react-hooks/incompatible-library
  const extraItems = watch("extraItems") || [];
  
  const additions = extraItems
    .filter(item => item.itemType === InvoiceItemType.PENALTY || item.itemType === InvoiceItemType.OTHER)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    
  const deductions = extraItems
    .filter(item => item.itemType === InvoiceItemType.DISCOUNT)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);

  const totalAmount = baseRent + electricity + water + services + additions - deductions;

  const onSubmit = async (data: CreateInvoiceDto) => {
    setIsSubmitting(true);
    try {
      await createInvoice({
        ...data,
        billingMonth: `${data.billingMonth}-01T00:00:00Z` // normalize to full date
      });
      navigate('/app/hoa-don'); // Adjust based on real routes
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setValue('status', InvoiceStatus.DRAFT);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tạo Hóa Đơn</h1>
          <p className="text-slate-500 mt-1">Tạo hóa đơn mới dựa trên hợp đồng và chỉ số sử dụng.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            Lưu Nháp
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            Phát Hành Hóa Đơn
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        <div className="flex-1 flex flex-col gap-6">
          {/* Section: Thông tin chung */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">description</span>
              Thông Tin Hóa Đơn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Hợp đồng / Phòng</Label>
                <Select onValueChange={(val) => setValue('contractId', Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hợp đồng..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="501">CNTR-2023-089 - Phòng 101</SelectItem>
                    <SelectItem value="502">CNTR-2023-092 - Phòng 102</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Kỳ Hóa Đơn (Tháng)</Label>
                <Input type="month" {...register("billingMonth", { required: true })} />
              </div>
            </div>
          </div>

          {/* Section: Các khoản phí cố định & tiện ích */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Chi Tiết Phí
              </h2>
              <Button variant="ghost" className="text-primary hover:text-blue-700">
                <span className="material-symbols-outlined text-[16px] mr-1">sync</span>
                Đồng Bộ Chỉ Số
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bed</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Thuê Phòng</p>
                  <p className="text-sm text-slate-500">Theo hợp đồng CNTR-2023-089</p>
                </div>
                <div className="text-right font-medium">{baseRent.toLocaleString()} ₫</div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Điện</p>
                  <p className="text-sm text-slate-500">350 kWh × 3,500 ₫</p>
                </div>
                <div className="text-right font-medium">{electricity.toLocaleString()} ₫</div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Nước</p>
                  <p className="text-sm text-slate-500">12 m³ × 25,000 ₫</p>
                </div>
                <div className="text-right font-medium">{water.toLocaleString()} ₫</div>
              </div>
            </div>
          </div>

          {/* Section: Điều chỉnh */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">tune</span>
              Điều Chỉnh Khác
            </h2>

            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <Select onValueChange={(val) => setValue(`extraItems.${index}.itemType`, val as InvoiceItemType)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InvoiceItemType.PENALTY}>Phạt</SelectItem>
                      <SelectItem value={InvoiceItemType.OTHER}>Phí khác</SelectItem>
                      <SelectItem value={InvoiceItemType.DISCOUNT}>Giảm giá</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input className="flex-1" placeholder="Mô tả" {...register(`extraItems.${index}.description` as const)} />
                  
                  <div className="flex items-center gap-2 w-32">
                    <Input type="number" className="text-right" placeholder="Số tiền" {...register(`extraItems.${index}.unitPrice` as const, { valueAsNumber: true })} />
                    <span className="text-sm text-slate-500">₫</span>
                  </div>
                  
                  <input type="hidden" {...register(`extraItems.${index}.quantity` as const, { valueAsNumber: true, value: 1 })} />

                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => remove(index)}>
                    <span className="material-symbols-outlined">delete</span>
                  </Button>
                </div>
              ))}
              
              <Button 
                variant="ghost" 
                className="self-start text-primary hover:text-blue-700"
                onClick={() => append({ itemType: InvoiceItemType.OTHER, description: '', quantity: 1, unitPrice: 0 })}
              >
                <span className="material-symbols-outlined mr-1">add</span>
                Thêm mục
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-6 bg-primary text-white rounded-xl p-6 shadow-md overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-xl font-bold relative z-10 mb-6">Tổng Kết Hóa Đơn</h2>
            
            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex justify-between items-center opacity-90">
                <span>Tiền Thuê Cơ Bản</span>
                <span>{baseRent.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span>Tiện Ích (Điện/Nước)</span>
                <span>{(electricity + water).toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span>Dịch Vụ</span>
                <span>{services.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between items-center opacity-90 text-green-300">
                <span>Phát Sinh Thêm</span>
                <span>+ {additions.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between items-center opacity-90 text-red-300">
                <span>Giảm Trừ</span>
                <span>- {deductions.toLocaleString()} ₫</span>
              </div>
            </div>
            
            <div className="w-full h-px bg-white/20 my-4 relative z-10"></div>
            
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-xs uppercase tracking-wider opacity-80">Tổng Cộng Cần Thanh Toán</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">{totalAmount.toLocaleString()}</span>
                <span className="text-xl opacity-80">₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
