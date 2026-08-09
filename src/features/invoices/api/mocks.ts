import { InvoiceStatus, DebtStatus, InvoiceItemType, Invoice, Debt } from '../types';

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    tenantId: 10,
    contractId: 501,
    renterId: 101,
    invoiceCode: 'INV-10-202607-ABC12',
    billingMonth: '2026-07-01T00:00:00Z',
    issueDate: '2026-07-01T00:00:00Z',
    dueDate: '2026-07-05T00:00:00Z',
    status: InvoiceStatus.UNPAID,
    subtotal: 5000000,
    penaltyAmount: 0,
    discountAmount: 0,
    totalAmount: 5000000,
    paidAmount: 0,
    debtAmount: 5000000,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
    items: [
      {
        id: 1,
        invoiceId: 1,
        itemType: InvoiceItemType.RENT,
        description: 'Tiền thuê phòng tháng 07/2026',
        quantity: 1,
        unitPrice: 4000000,
        amount: 4000000,
      },
      {
        id: 2,
        invoiceId: 1,
        itemType: InvoiceItemType.SERVICE,
        description: 'Phí dịch vụ chung',
        quantity: 1,
        unitPrice: 1000000,
        amount: 1000000,
      }
    ],
    room: {
      id: 101,
      code: 'P101',
      title: 'Phòng 101 - Tòa nhà A',
    },
    renter: {
      id: 101,
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567'
    }
  },
  {
    id: 2,
    tenantId: 10,
    contractId: 502,
    renterId: 102,
    invoiceCode: 'INV-10-202607-XYZ89',
    billingMonth: '2026-07-01T00:00:00Z',
    issueDate: '2026-07-01T00:00:00Z',
    dueDate: '2026-07-05T00:00:00Z',
    status: InvoiceStatus.PAID,
    subtotal: 3500000,
    penaltyAmount: 0,
    discountAmount: 0,
    totalAmount: 3500000,
    paidAmount: 3500000,
    debtAmount: 0,
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-03T00:00:00Z',
    items: [
      {
        id: 3,
        invoiceId: 2,
        itemType: InvoiceItemType.RENT,
        description: 'Tiền thuê phòng tháng 07/2026',
        quantity: 1,
        unitPrice: 3000000,
        amount: 3000000,
      },
      {
        id: 4,
        invoiceId: 2,
        itemType: InvoiceItemType.ELECTRICITY,
        description: 'Tiền điện',
        quantity: 100,
        unitPrice: 3500,
        amount: 350000,
      },
      {
        id: 5,
        invoiceId: 2,
        itemType: InvoiceItemType.WATER,
        description: 'Tiền nước',
        quantity: 5,
        unitPrice: 30000,
        amount: 150000,
      }
    ],
    room: {
      id: 102,
      code: 'P102',
      title: 'Phòng 102 - Tòa nhà A',
    },
    renter: {
      id: 102,
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678'
    }
  }
];

export const mockDebts: Debt[] = mockInvoices.map((inv) => ({
  id: inv.id,
  tenantId: inv.tenantId,
  invoiceId: inv.id,
  originalAmount: inv.totalAmount,
  paidAmount: inv.paidAmount,
  remainingAmount: inv.debtAmount,
  status: inv.debtAmount > 0 ? DebtStatus.OPEN : DebtStatus.PAID,
  dueDate: inv.dueDate,
  createdAt: inv.createdAt,
  updatedAt: inv.updatedAt,
  invoice: inv,
  room: inv.room,
  renter: inv.renter,
  contract: inv.contract,
}));
