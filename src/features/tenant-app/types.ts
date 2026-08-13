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
  address: string
  province: string
  district: string
  ward: string
  propertyType: string
  floorsCount: number
  roomsCount: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'
  createdAt: string
}

export interface Room {
  id: number
  tenantId?: number
  propertyId: number
  floorId?: number | null
  roomCode: string
  title: string
  floor?: number
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
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
