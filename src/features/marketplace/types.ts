export interface MarketplaceRoom {
  id: number
  title: string
  roomCode: string
  basePrice: number
  deposit: number | null
  electricityPrice: number | null
  waterPrice: number | null
  area: number
  maxOccupants: number
  status: string
  marketplaceStatus: string
  property: {
    id: number
    name: string
    address: string
    province: string
    district: string
    ward: string
    propertyType: string
    latitude: number | null
    longitude: number | null
  }
  images: Array<{
    id: number
    url: string
    isThumbnail: boolean
    sortOrder: number
  }>
  amenities: Array<{
    id: number
    name: string
    icon: string | null
  }>
}

export interface MarketplaceFilters {
  page?: number
  limit?: number
  search?: string
  province?: string
  district?: string
  ward?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  maxOccupants?: number
  amenityIds?: number[] | string
}

export interface CreateViewingBody {
  scheduledAt: string // ISO date
  note?: string | null
}

export interface CreateRentalRequestBody {
  expectedStartDate: string // YYYY-MM-DD
  message?: string | null
  appointmentId?: number | null
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
