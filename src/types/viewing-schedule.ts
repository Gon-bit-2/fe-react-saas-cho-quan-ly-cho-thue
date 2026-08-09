export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'CANCELED'
  | 'COMPLETED';

export interface ViewingSchedule {
  id: number;
  tenantId: number;
  renterId: number;
  roomId: number;
  propertyId: number;
  status: AppointmentStatus;
  scheduledAt?: string | null;
  assignedStaffId?: number | null;
  landlordNote?: string | null;
  createdAt: string;
  updatedAt: string;
}
