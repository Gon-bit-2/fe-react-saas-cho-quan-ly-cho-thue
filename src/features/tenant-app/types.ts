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
  propertyId: number
  roomCode: string
  floor: number
  area: number
  basePrice: number
  maxOccupants: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  marketplaceStatus: 'UNPUBLISHED' | 'PUBLISHED'
  createdAt: string
  property?: Property
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
