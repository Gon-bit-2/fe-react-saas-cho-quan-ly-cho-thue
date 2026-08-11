export type TReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'

export type TReview = {
  id: number
  contractId: number
  rating: number
  content: string
  cleanlinessScore: number
  locationScore: number
  priceScore: number
  serviceScore: number
  status: TReviewStatus
  reviewerId: number
  roomId: number
  tenantId: number
  createdAt: string
  updatedAt: string
  // Additional frontend-specific helper fields if needed
  reviewerName?: string
  roomName?: string
}

export type TListAdminReviewsQuery = {
  page?: number
  limit?: number
  status?: TReviewStatus
  tenantId?: number
  roomId?: number
  reviewerId?: number
  from?: string
  to?: string
  search?: string
}

export type TUpdateReviewStatusBody = {
  status: 'APPROVED' | 'REJECTED' | 'HIDDEN'
  reason?: string
}
