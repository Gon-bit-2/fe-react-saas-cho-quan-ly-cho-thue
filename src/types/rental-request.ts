export type RentalRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEED_MORE_INFO'
  | 'CANCELED'
  | 'CONVERTED_TO_CONTRACT';

export interface RentalRequest {
  id: number;
  tenantId: number;
  renterId: number;
  roomId: number;
  propertyId: number;
  status: RentalRequestStatus;
  expectedStartDate?: string | null;
  message?: string | null;
  appointmentId?: number | null;
  createdAt: string;
  updatedAt: string;
}
