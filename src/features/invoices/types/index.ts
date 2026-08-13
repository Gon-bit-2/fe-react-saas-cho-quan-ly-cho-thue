export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELED: 'CANCELED',
} as const

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export const DebtStatus = {
  OPEN: 'OPEN',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELED: 'CANCELED',
} as const

export type DebtStatus = (typeof DebtStatus)[keyof typeof DebtStatus]

export const InvoiceItemType = {
  RENT: 'RENT',
  ELECTRICITY: 'ELECTRICITY',
  WATER: 'WATER',
  SERVICE: 'SERVICE',
  PARKING: 'PARKING',
  INTERNET: 'INTERNET',
  OTHER: 'OTHER',
  PENALTY: 'PENALTY',
  DISCOUNT: 'DISCOUNT',
} as const

export type InvoiceItemType = (typeof InvoiceItemType)[keyof typeof InvoiceItemType]

export interface InvoiceItem {
  id: number
  invoiceId: number
  itemType: InvoiceItemType
  description: string
  quantity: number
  unitPrice: number
  amount: number
  meterReadingId?: number | null
}

export interface Debt {
  id: number
  tenantId: number
  invoiceId: number
  originalAmount: number
  paidAmount: number
  remainingAmount: number
  status: DebtStatus
  dueDate: string
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
  invoice?: Invoice
  contract?: unknown
  room?: unknown
  renter?: unknown
}

export interface Invoice {
  id: number
  tenantId: number
  contractId: number
  renterId: number
  invoiceCode: string
  billingMonth: string
  issueDate: string
  dueDate: string
  note?: string
  status: InvoiceStatus
  subtotal: number
  penaltyAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  debtAmount: number
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
  debt?: Debt
  _count?: {
    payments: number
  }
  contract?: {
    id: number
    code: string
    status: string
    startDate: string
    endDate: string
  }
  room?: {
    id: number
    code: string
    title: string
  }
  property?: {
    id: number
    name: string
    address: string
  }
  renter?: {
    id: number
    fullName: string
    email: string
    phone: string
  }
}

export interface InvoiceListParams {
  page?: number
  limit?: number
  billingMonth?: string
  from?: string
  to?: string
  roomId?: number
  contractId?: number
  renterId?: number
  propertyId?: number
  search?: string
  status?: InvoiceStatus
}

export interface CreateInvoiceDto {
  contractId: number
  billingMonth: string // YYYY-MM-DD
  issueDate?: string
  dueDate?: string
  note?: string
  status?: typeof InvoiceStatus.DRAFT | typeof InvoiceStatus.UNPAID
  extraItems?: {
    itemType: InvoiceItemType
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export interface UpdateInvoiceDto {
  issueDate?: string
  dueDate?: string
  note?: string
  extraItems?: {
    itemType: InvoiceItemType
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export interface InvoiceListResponse {
  data: Invoice[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DebtListResponse {
  data: Debt[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats?: {
    totalOutstanding: number
    overdueMoreThan30Days: number
    overdueWithin30Days: number
    currentNotDue: number
  }
}
