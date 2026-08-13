import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceItemType, type UpdateInvoiceDto, type Invoice, type InvoiceItem } from '../types';
import { getInvoiceDetail, updateDraftInvoice, issueInvoice } from '../api';

type InvoiceEditFormValues = UpdateInvoiceDto & {
  extraItems: NonNullable<UpdateInvoiceDto['extraItems']>
}

export function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<InvoiceEditFormValues>({
    defaultValues: {
      extraItems: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraItems"
  });

  useEffect(() => {
    if (id) {
      getInvoiceDetail(id).then((data) => {
        setInvoice(data);
        const editableItemTypes: InvoiceItemType[] = [
          InvoiceItemType.PENALTY,
          InvoiceItemType.OTHER,
          InvoiceItemType.DISCOUNT,
        ];
        const extraItems = data.items
          .filter((item) => editableItemTypes.includes(item.itemType))
          .map(i => ({
            itemType: i.itemType,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          }));
        
        reset({
          issueDate: data.issueDate ? data.issueDate.substring(0, 10) : undefined,
          dueDate: data.dueDate ? data.dueDate.substring(0, 10) : undefined,
          note: data.note || '',
          extraItems
        });
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [id, reset]);

  const baseRent = invoice?.items?.find((i: InvoiceItem) => i.itemType === InvoiceItemType.RENT)?.amount || 0;
  const electricity = invoice?.items?.find((i: InvoiceItem) => i.itemType === InvoiceItemType.ELECTRICITY)?.amount || 0;
  const water = invoice?.items?.find((i: InvoiceItem) => i.itemType === InvoiceItemType.WATER)?.amount || 0;
  const services = invoice?.items?.find((i: InvoiceItem) => i.itemType === InvoiceItemType.SERVICE)?.amount || 0;

  const extraItems = watch("extraItems") || [];
  
  const additions = extraItems
    .filter(item => item.itemType === InvoiceItemType.PENALTY || item.itemType === InvoiceItemType.OTHER)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    
  const deductions = extraItems
    .filter(item => item.itemType === InvoiceItemType.DISCOUNT)
    .reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);

  const totalAmount = baseRent + electricity + water + services + additions - deductions;

  const onSubmit = async (data: UpdateInvoiceDto) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateDraftInvoice(id, data);
      navigate('/hoa-don');
    } catch (error) {
      console.error('Failed to update invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssue = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // First save changes, then issue
      // eslint-disable-next-line react-hooks/incompatible-library
      await updateDraftInvoice(id, watch());
      await issueInvoice(id);
      navigate('/hoa-don');
    } catch (error) {
      console.error('Failed to issue invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full p-8 bg-background min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chỉnh Sửa Hóa Đơn Nháp</h1>
          <p className="text-slate-500 mt-1">Hóa đơn: {invoice?.invoiceCode}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Lưu Thay Đổi
          </Button>
          <Button onClick={handleIssue} disabled={isSubmitting} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">send</span>
            Phát Hành
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        <div className="flex-1 flex flex-col gap-6">
          {/* Section: Thông tin chung (Readonly) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">description</span>
              Thông Tin Hóa Đơn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Hợp đồng / Phòng</Label>
                <div className="p-2 bg-slate-50 rounded border text-slate-700">
                  {invoice?.room?.title}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Kỳ Hóa Đơn (Tháng)</Label>
                <div className="p-2 bg-slate-50 rounded border text-slate-700">
                  {invoice?.billingMonth ? new Date(invoice.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : ''}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Hạn Thanh Toán</Label>
                <Input type="date" {...register("dueDate")} />
              </div>
            </div>
          </div>

          {/* Section: Các khoản phí cố định & tiện ích */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Chi Tiết Phí Cơ Bản
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bed</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Thuê Phòng</p>
                </div>
                <div className="text-right font-medium">{baseRent.toLocaleString()} ₫</div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Điện</p>
                </div>
                <div className="text-right font-medium">{electricity.toLocaleString()} ₫</div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Tiền Nước</p>
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
                  <Select 
                    defaultValue={field.itemType}
                    onValueChange={(val) => setValue(`extraItems.${index}.itemType`, val as InvoiceItemType)}
                  >
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
