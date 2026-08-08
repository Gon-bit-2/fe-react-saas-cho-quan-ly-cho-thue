export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE';
export type MarketplaceStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN';

export interface Room {
  id: number;
  propertyId: number;
  floorId?: number | null;
  roomCode: string;
  title: string;
  area: number;
  maxOccupants: number;
  basePrice: number;
  depositAmount: number;
  electricityPrice: number;
  waterPrice: number;
  description?: string | null;
  status: RoomStatus;
  marketplaceStatus: MarketplaceStatus;
  createdAt: string;
  updatedAt: string;
  amenities?: RoomAmenity[];
  images?: RoomImage[];
}

export interface RoomAmenity {
  id: number;
  roomId: number;
  amenityId: number;
}

export interface RoomImage {
  id: number;
  roomId: number;
  url: string;
  caption?: string | null;
  sortOrder: number;
  isThumbnail: boolean;
  createdAt: string;
  updatedAt: string;
}
