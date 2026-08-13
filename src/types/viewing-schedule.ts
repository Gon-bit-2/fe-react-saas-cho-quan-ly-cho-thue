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

export interface ViewingScheduleDetail extends Omit<ViewingSchedule, 'scheduledAt'> {
  scheduledAt: string;
  note?: string | null;
  room: {
    id: number;
    roomCode: string;
    title: string;
    basePrice: number;
    depositAmount: number;
    property: {
      id: number;
      name: string;
      addressDetail: string;
      ward: string;
      district: string;
      province: string;
    };
  };
  renter: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string | null;
  };
  assignedStaff?: {
    id: number;
    fullName: string;
  } | null;
}
