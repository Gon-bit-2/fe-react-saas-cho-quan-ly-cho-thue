export interface MarketplaceRoom {
  id: number
  title: string
  roomCode: string
  basePrice: number
  depositAmount: number | null
  electricityPrice: number | null
  waterPrice: number | null
  area: number | null
  maxOccupants: number
  status: string
  marketplaceStatus: string
  description?: string | null
  property: {
    id: number
    name: string
    province: string
    provinceCode?: string | null
    district: string | null
    ward: string
    wardCode?: string | null
    addressDetail?: string
    latitude?: number | null
    longitude?: number | null
    type: string
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
  provinceCode?: string
  district?: string
  ward?: string
  wardCode?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  maxOccupants?: number
  amenityIds?: number[] | string
  lat?: number
  lng?: number
  radius?: number
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
