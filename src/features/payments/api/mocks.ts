import { Payment, PaymentMethod, PaymentStatus } from '../types';

export const mockPayments: Payment[] = [
  {
    id: 1,
    tenantId: 10,
    invoiceId: 1,
    payerId: 101,
    amount: 5000000,
    method: PaymentMethod.BANK_TRANSFER,
    provider: 'MANUAL_CONFIRMATION',
    transactionCode: 'MB-123456789',
    status: PaymentStatus.PENDING,
    submittedAt: '2026-07-02T10:30:00Z',
    paidAt: '2026-07-02T10:00:00Z',
    evidenceUrl: 'https://example.com/evidence1.jpg',
    renterNote: 'Đã thanh toán tiền phòng',
    createdAt: '2026-07-02T10:30:00Z',
    updatedAt: '2026-07-02T10:30:00Z',
    invoice: {
      id: 1,
      invoiceCode: 'INV-10-202607-ABC12',
      status: 'UNPAID',
      totalAmount: 5000000,
      paidAmount: 0,
      debtAmount: 5000000,
      dueDate: '2026-07-05T00:00:00Z',
    },
    room: {
      id: 101,
      code: 'P101',
      title: 'Phòng 101 - Tòa nhà A',
    },
    payer: {
      id: 101,
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567'
    }
  },
  {
    id: 2,
    tenantId: 10,
    invoiceId: 2,
    payerId: 102,
    amount: 3500000,
    method: PaymentMethod.QR,
    provider: 'PayOS',
    transactionCode: 'PAYOS-987654321',
    status: PaymentStatus.SUCCESS,
    submittedAt: '2026-07-03T15:00:00Z',
    paidAt: '2026-07-03T14:55:00Z',
    renterNote: 'Thanh toán qua mã QR PayOS',
    landlordNote: 'Đã nhận được tiền',
    approvedById: 10,
    approvedAt: '2026-07-03T15:10:00Z',
    createdAt: '2026-07-03T15:00:00Z',
    updatedAt: '2026-07-03T15:10:00Z',
    invoice: {
      id: 2,
      invoiceCode: 'INV-10-202607-XYZ89',
      status: 'PAID',
      totalAmount: 3500000,
      paidAmount: 3500000,
      debtAmount: 0,
      dueDate: '2026-07-05T00:00:00Z',
    },
    room: {
      id: 102,
      code: 'P102',
      title: 'Phòng 102 - Tòa nhà A',
    },
    payer: {
      id: 102,
      fullName: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678'
    },
    approver: {
      id: 10,
      fullName: 'Admin Landlord'
    }
  }
];
