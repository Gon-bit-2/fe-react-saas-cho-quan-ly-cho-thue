import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceItemType, InvoiceStatus } from '../types';
import type { CreateInvoiceDto } from '../types';
import { createInvoice } from '../api';
import { useContracts } from '@/shared/api/contracts';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

type InvoiceCreateFormValues = CreateInvoiceDto & {
  extraItems: NonNullable<CreateInvoiceDto['extraItems']>
}

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: contractsResponse, isLoading: isLoadingContracts } = useContracts({ limit: 100 });
  const contracts = contractsResponse?.data || [];

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceCreateFormValues>({
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

  const extraItems = watch("extraItems") || [];
  
  const additions = extraItems
    .filter(item => item.itemType === InvoiceItemType.PENALTY || item.itemType === InvoiceItemType.OTHER)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    
  const deductions = extraItems
    .filter(item => item.itemType === InvoiceItemType.DISCOUNT)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);

  const onSubmit = async (data: CreateInvoiceDto) => {
    if (!data.contractId) {
      toast.error('Vui lòng chọn hợp đồng!');
      return;
    }
    setIsSubmitting(true);
    try {
      await createInvoice({
        ...data,
        billingMonth: `${data.billingMonth}-01T00:00:00Z`
      });
      toast.success('Đã tạo hóa đơn thành công!');
      navigate('/hoa-don'); 
    } catch (error: unknown) {
      console.error('Failed to create invoice:', error);
      const message = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Có lỗi xảy ra khi tạo hóa đơn');
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
                  <SelectTrigger disabled={isLoadingContracts}>
                    <SelectValue placeholder={isLoadingContracts ? "Đang tải..." : "Chọn hợp đồng..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map(contract => (
                      <SelectItem key={contract.id} value={contract.id.toString()}>
                        {contract.contractCode} - {contract.room?.title || `Phòng ${contract.roomId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Kỳ Hóa Đơn (Tháng)</Label>
                <Input type="month" {...register("billingMonth", { required: true })} />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5">info</span>
              <div>
                <strong>Lưu ý:</strong> Tiền thuê cơ bản, phí dịch vụ (điện, nước, rác...) sẽ được hệ thống <strong>tự động tính toán</strong> dựa trên hợp đồng và chỉ số chốt của tháng tương ứng khi bạn tạo hóa đơn.
              </div>
            </div>
          </div>

          {/* Section: Điều chỉnh */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">tune</span>
              Điều Chỉnh Khác (Tùy Chọn)
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
                  
                  <Input className="flex-1" placeholder="Mô tả" {...register(`extraItems.${index}.description` as const, { required: true })} />
                  
                  <div className="flex items-center gap-2 w-32">
                    <Input type="number" className="text-right" placeholder="Số tiền" {...register(`extraItems.${index}.unitPrice` as const, { valueAsNumber: true, required: true, min: 0 })} />
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
                Thêm khoản mục
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-6 bg-primary text-white rounded-xl p-6 shadow-md overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-xl font-bold relative z-10 mb-6">Tạm Tính Phụ Phí</h2>
            
            <div className="flex flex-col gap-3 relative z-10">
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
              <span className="text-xs uppercase tracking-wider opacity-80">Tổng Cộng Phụ Phí</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{(additions - deductions).toLocaleString()}</span>
                <span className="text-xl opacity-80">₫</span>
              </div>
              <span className="text-xs mt-2 opacity-80 block">* Hệ thống sẽ cộng thêm tiền thuê cơ bản và chi phí điện/nước/dịch vụ khi xuất hóa đơn.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
