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

      {/* Content Snapshot */}
      <div
        className="prose prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 mb-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: contract.contentSnapshot }}
      />

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
