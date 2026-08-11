export type CleanupEntry = {
  type: string
  id: number | string
  disposition: 'deleted' | 'closed' | 'inactive' | 'retained' | 'cleanup-failed'
  detail?: string
}

export type RunContext = {
  runId: string
  tenantId?: number
  landlordId?: number
  renterId?: number
  propertyId?: number
  floorId?: number
  roomId?: number
  assetCategoryId?: number
  roomAssetId?: number
  rentalRequestId?: number
  appointmentId?: number
  contractId?: number
  handoverId?: number
  checkoutHandoverId?: number
  serviceItemId?: number
  serviceAssignmentId?: number
  meterId?: number
  readingId?: number
  invoiceId?: number
  overdueInvoiceId?: number
  canceledInvoiceId?: number
  paymentId?: number
  rejectedPaymentId?: number
  ticketId?: number
  canceledTicketId?: number
  reviewId?: number
  reportId?: number
  terminationId?: number
  planId?: number
  adminTenantId?: number
  amenityId?: number
  cleanup: CleanupEntry[]
}

export function publicRunContext(context: RunContext) {
  return JSON.parse(JSON.stringify(context)) as RunContext
}
