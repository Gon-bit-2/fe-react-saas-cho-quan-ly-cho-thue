import { forwardRef } from 'react'
import type { Contract } from '@/types/contract'

interface ContractPrintTemplateProps {
  contract: Contract
}

export const ContractPrintTemplate = forwardRef<HTMLDivElement, ContractPrintTemplateProps>(({ contract }, ref) => {
  return (
    <div ref={ref} className="mx-auto hidden min-h-[297mm] max-w-[210mm] bg-white p-8 text-black print:block">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-xl font-bold uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</h1>
        <h2 className="mb-6 text-lg font-bold underline">Độc lập - Tự do - Hạnh phúc</h2>
        <h3 className="text-2xl font-bold uppercase">Hợp Đồng Thuê Phòng</h3>
        <p className="text-sm italic">Mã HĐ: {contract.contractCode || `#${contract.id}`}</p>
      </div>

      {/* Contract Content */}
      <div className="mb-12 space-y-4 text-sm">
        <p>
          Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, tại địa
          chỉ nhà trọ, chúng tôi gồm:
        </p>

        <div className="space-y-1">
          <p className="font-bold uppercase">BÊN CHO THUÊ (BÊN A):</p>
          <p>
            - Ông/Bà: <strong>{contract.tenant?.name || '...........................................'}</strong>
          </p>
          <p>- Số điện thoại: ...........................................</p>
        </div>

        <div className="space-y-1">
          <p className="font-bold uppercase">BÊN THUÊ (BÊN B):</p>
          <p>
            - Ông/Bà: <strong>{contract.renter?.fullName || '...........................................'}</strong>
          </p>
          <p>- Số điện thoại: {contract.renter?.phone || '...........................................'}</p>
          <p>
            - CCCD/CMND số:{' '}
            {contract.renter?.renterProfile?.identityNumber || '...........................................'}
          </p>
          <p>
            - Nơi thường trú:{' '}
            {contract.renter?.renterProfile?.permanentAddress || '...........................................'}
          </p>
        </div>

        <p className="mt-4 font-bold italic">Hai bên thống nhất ký kết hợp đồng thuê phòng với các điều khoản sau:</p>

        <div className="space-y-2">
          <p className="font-bold uppercase">ĐIỀU 1: ĐỐI TƯỢNG VÀ MỤC ĐÍCH THUÊ</p>
          <p>
            - Bên A đồng ý cho Bên B thuê phòng:{' '}
            <strong>{contract.room?.title || contract.room?.roomCode || '.....................'}</strong>.
          </p>
          <p>- Mục đích sử dụng: Để ở.</p>
        </div>

        <div className="space-y-2">
          <p className="font-bold uppercase">ĐIỀU 2: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN</p>
          <p>
            - Giá thuê phòng:{' '}
            <strong>
              {contract.monthlyPrice ? Number(contract.monthlyPrice).toLocaleString('vi-VN') : '.....................'}{' '}
              VNĐ/tháng
            </strong>{' '}
            (Bằng chữ: ...........................................).
          </p>
          <p>
            - Tiền đặt cọc:{' '}
            <strong>
              {contract.depositAmount
                ? Number(contract.depositAmount).toLocaleString('vi-VN')
                : '.....................'}{' '}
              VNĐ
            </strong>
            .
          </p>
          <p>
            - Thời hạn thanh toán: Bên B thanh toán tiền phòng vào ngày <strong>{contract.paymentDueDay || '5'}</strong>{' '}
            hàng tháng.
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-bold uppercase">ĐIỀU 3: THỜI HẠN HỢP ĐỒNG</p>
          <p>
            - Thời hạn thuê là: Từ ngày{' '}
            <strong>{contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '...'}</strong> đến
            ngày <strong>{contract.endDate ? new Date(contract.endDate).toLocaleDateString('vi-VN') : '...'}</strong>.
          </p>
          <p>- Nếu Bên B muốn chấm dứt hợp đồng trước thời hạn phải báo cho Bên A trước ít nhất 30 ngày.</p>
        </div>

        <div className="space-y-2">
          <p className="font-bold uppercase">ĐIỀU 4: TRÁCH NHIỆM CỦA CÁC BÊN</p>
          <p>
            - Trách nhiệm Bên A: Bàn giao phòng và các trang thiết bị (nếu có) đúng ngày; tạo điều kiện thuận lợi cho
            Bên B sinh hoạt.
          </p>
          <p>
            - Trách nhiệm Bên B: Đóng tiền thuê đúng hạn; giữ gìn vệ sinh chung, an ninh trật tự; bồi thường nếu làm hư
            hỏng tài sản của Bên A.
          </p>
        </div>

        {contract.contentSnapshot &&
          contract.contentSnapshot.trim() !== 'Hợp đồng tiêu chuẩn' &&
          !contract.contentSnapshot.includes('ĐIỀU 1: ĐỐI TƯỢNG') && (
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              <p className="font-bold uppercase">ĐIỀU KHOẢN BỔ SUNG (GHI CHÚ):</p>
              <div className="whitespace-pre-wrap">{contract.contentSnapshot}</div>
            </div>
          )}
      </div>

      {/* Signatures */}
      <div className="mt-12 grid break-inside-avoid grid-cols-2 gap-8">
        <div className="text-center">
          <h4 className="mb-2 font-bold uppercase">Đại diện bên cho thuê</h4>
          <p className="mb-4 text-sm italic">(Ký và ghi rõ họ tên)</p>
          {contract.landlordSignature ? (
            <div className="flex h-32 items-center justify-center">
              <img src={contract.landlordSignature} alt="Landlord signature" className="max-h-full max-w-full" />
            </div>
          ) : (
            <div className="h-32"></div>
          )}
          <p className="font-bold">{contract.tenant?.name || 'Chủ trọ'}</p>
        </div>

        <div className="text-center">
          <h4 className="mb-2 font-bold uppercase">Đại diện bên thuê</h4>
          <p className="mb-4 text-sm italic">(Ký và ghi rõ họ tên)</p>
          {contract.renterSignature ? (
            <div className="flex h-32 items-center justify-center">
              <img src={contract.renterSignature} alt="Renter signature" className="max-h-full max-w-full" />
            </div>
          ) : (
            <div className="h-32"></div>
          )}
          <p className="font-bold">{contract.renter?.fullName || 'Khách thuê'}</p>
        </div>
      </div>
    </div>
  )
})

ContractPrintTemplate.displayName = 'ContractPrintTemplate'
