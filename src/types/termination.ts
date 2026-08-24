export const TerminationRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const
export type TerminationRequestStatus = (typeof TerminationRequestStatus)[keyof typeof TerminationRequestStatus]

export interface ContractTerminationRequest {
  id: number
  contractId: number
  renterId: number
  expectedMoveOutDate: string
  reason?: string
  status: TerminationRequestStatus
  notes?: string
  staffNote?: string
  createdAt: string
  updatedAt: string
}
