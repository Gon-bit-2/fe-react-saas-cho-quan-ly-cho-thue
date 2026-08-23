export const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  QR: 'QR',
  CASH: 'CASH',
  WALLET: 'WALLET',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface PaymentQrCode {
  id: number;
  tenantId: number;
  invoiceId: number;
  provider: string;
  orderCode: string;
  paymentLinkId: string;
  qrContent: string;
  checkoutUrl?: string;
  qrImageUrl?: string;
  amount: number;
  providerStatus: string;
  expiredAt: string;
  status: string;
}

export interface Payment {
  id: number;
  tenantId: number;
  invoiceId: number;
  payerId: number;
  qrCodeId?: number | null;
  amount: number;
  method: PaymentMethod;
  provider: string;
  transactionCode?: string;
  status: PaymentStatus;
  paidAt?: string;
  submittedAt?: string;
  evidenceUrl?: string;
  renterNote?: string;
  landlordNote?: string;
  approvedById?: number;
  approvedAt?: string;
  rejectedById?: number;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  qrCode?: PaymentQrCode;
  invoice?: {
    id: number;
    invoiceCode: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    debtAmount: number;
    dueDate: string;
  };
  room?: {
    id: number;
    code: string;
    title: string;
  };
  payer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  approver?: {
    id: number;
    fullName: string;
  };
  rejecter?: {
    id: number;
    fullName: string;
  };
}

export interface ManualConfirmationDto {
  amount: number;
  transactionCode?: string;
  evidenceUrl?: string;
  renterNote?: string;
  paidAt?: string; // YYYY-MM-DDTHH:mm:ssZ
}

export interface ApprovePaymentDto {
  landlordNote?: string;
}

export interface RejectPaymentDto {
  landlordNote?: string;
}

export interface PaymentListResponse {
  data: Payment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  invoiceId?: number;
  renterId?: number;
  from?: string;
  to?: string;
  search?: string;
}
