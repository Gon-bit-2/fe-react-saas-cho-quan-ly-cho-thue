export enum TerminationRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface ContractTerminationRequest {
  id: number
  contractId: number
  renterId: number
  requestedDate: string
  desiredEndDate: string
  reason?: string
  status: TerminationRequestStatus
  notes?: string
  staffNote?: string
  createdAt: string
  updatedAt: string
}
