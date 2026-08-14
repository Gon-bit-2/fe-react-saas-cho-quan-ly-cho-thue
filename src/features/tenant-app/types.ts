export interface DashboardSummary {
  totalRooms: number
  availableRooms: number
  totalContracts: number
  activeContracts: number
  totalRevenue: number
  unpaidInvoices: number
  openTickets: number
}

export interface RevenueTrend {
  date: string // YYYY-MM-DD
  revenue: number
}

export interface RecentActivity {
  id: string
  type: 'INVOICE' | 'PAYMENT' | 'TICKET'
  title: string
  description: string
  createdAt: string
  status: string
}

export interface ActionCenterRoom {
  id: number
  roomCode: string
  title: string
  property: { id: number; name: string }
}

interface ActionCenterPerson {
  id: number
  fullName: string
}

interface ActionCenterCollection<T> {
  total: number
  items: T[]
}

export interface ActionCenterResponse {
  tenantId: number
  pendingRequests: ActionCenterCollection<{
    id: number
    status: 'PENDING'
    expectedStartDate: string
    createdAt: string
    renter: ActionCenterPerson
    room: ActionCenterRoom
  }>
  expiringContracts: ActionCenterCollection<{
    id: number
    contractCode: string
    status: 'ACTIVE'
    endDate: string
    renter: ActionCenterPerson
    room: ActionCenterRoom
  }>
  unpaidInvoices: ActionCenterCollection<{
    id: number
    invoiceCode: string
    status: 'UNPAID' | 'PARTIALLY_PAID' | 'OVERDUE'
    dueDate: string
    debtAmount: number
    daysOverdue: number
    renter: ActionCenterPerson
    room: ActionCenterRoom
  }>
  openTickets: ActionCenterCollection<{
    id: number
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_RENTER'
    createdAt: string
    createdBy: ActionCenterPerson | null
    room: ActionCenterRoom
  }>
}

export interface Property {
  id: number
  name: string
  addressDetail: string
  province: string
  provinceCode?: string | null
  district: string | null
  ward: string
  wardCode?: string | null
  latitude?: number | null
  longitude?: number | null
  type: string
  _count?: {
    floors: number
    rooms: number
  }
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  createdAt: string
}

export interface Floor {
  id: number
  tenantId: number
  propertyId: number
  name: string
  floorNumber: number
  createdAt: string
}

export interface Room {
  id: number
  tenantId?: number
  propertyId: number
  floorId?: number | null
  roomCode: string
  title: string
  floor?: { id: number; name: string; floorNumber: number } | null
  area?: number | null
  basePrice: number
  depositAmount?: number | null
  electricityPrice?: number | null
  waterPrice?: number | null
  description?: string | null
  maxOccupants: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE'
  marketplaceStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN'
  createdAt: string
  updatedAt: string
  property?: Property
  amenities?: Array<{
    amenity: {
      id: number
      name: string
      icon?: string | null
      category?: string
      isActive?: boolean
    }
  }>
  images?: Array<{
    id: number
    url: string
    caption?: string | null
    sortOrder: number
    isThumbnail: boolean
  }>
}

// Params
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export interface PropertyListParams extends PaginationParams {
  status?: string
}

export interface RoomListParams extends PaginationParams {
  propertyId?: number
  floorId?: number
  status?: string
}

export interface CreatePropertyDto {
  name: string
  type: 'HOUSE' | 'MINI_APARTMENT' | 'DORM' | 'APARTMENT'
  province?: string
  district?: string | null
  ward?: string
  addressDetail: string
  location?: {
    provinceCode: string
    wardCode: string
    placeId: string
    sessionToken?: string
  }
  description?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  floorsCount?: number
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>

export interface CreateRoomDto {
  propertyId: number
  floorId?: number | null
  roomCode: string
  title: string
  area: number
  maxOccupants: number
  basePrice: number
  depositAmount: number
  electricityPrice: number
  waterPrice: number
  description?: string
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'INACTIVE'
  amenityIds?: number[]
}

export type UpdateRoomDto = Partial<Omit<CreateRoomDto, 'propertyId' | 'amenityIds' | 'status'>>

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
