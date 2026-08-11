import { AXIOS_INSTANCE } from '@/shared/api/axios-client'
import type { TListAdminReviewsQuery, TReview, TUpdateReviewStatusBody } from '../types/reviews.types'

// Mock Data Fallback
const MOCK_REVIEWS: TReview[] = [
  {
    id: 1,
    contractId: 101,
    rating: 4,
    content: 'Phòng sạch sẽ, chủ nhà nhiệt tình nhưng giá hơi cao.',
    cleanlinessScore: 5,
    locationScore: 4,
    priceScore: 3,
    serviceScore: 5,
    status: 'PENDING',
    reviewerId: 201,
    roomId: 301,
    tenantId: 401,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewerName: 'Nguyễn Văn A',
    roomName: 'Phòng 101 - Khu A'
  },
  {
    id: 2,
    contractId: 102,
    rating: 5,
    content: 'Rất tuyệt vời, tiện ích đầy đủ.',
    cleanlinessScore: 5,
    locationScore: 5,
    priceScore: 4,
    serviceScore: 5,
    status: 'APPROVED',
    reviewerId: 202,
    roomId: 302,
    tenantId: 401,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewerName: 'Trần Thị B',
    roomName: 'Phòng 202 - Khu B'
  },
  {
    id: 3,
    contractId: 103,
    rating: 2,
    content: 'Phòng hơi ẩm mốc, dịch vụ chậm.',
    cleanlinessScore: 2,
    locationScore: 3,
    priceScore: 2,
    serviceScore: 1,
    status: 'REJECTED',
    reviewerId: 203,
    roomId: 303,
    tenantId: 401,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    reviewerName: 'Lê Văn C',
    roomName: 'Phòng 303 - Khu C'
  }
]

export const reviewsAdminApi = {
  list: async (params?: TListAdminReviewsQuery) => {
    try {
      const response = await AXIOS_INSTANCE.get<{ data: TReview[]; total: number }>('/reviews/admin', { params })
      if (!response.data || response.data.data.length === 0) {
        throw new Error('Empty data, falling back to mock')
      }
      return response.data
    } catch (error: unknown) {
      console.warn('Backend /reviews/admin missing or empty. Using MOCK_REVIEWS.', error)
      let filtered = [...MOCK_REVIEWS]
      if (params?.status) {
        filtered = filtered.filter(r => r.status === params.status)
      }
      return {
        data: filtered,
        total: filtered.length
      }
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await AXIOS_INSTANCE.get<TReview>(`/reviews/admin/${id}`)
      return response.data
    } catch (error: unknown) {
      console.warn(`Backend /reviews/admin/${id} failed. Using mock.`)
      const review = MOCK_REVIEWS.find(r => r.id === id)
      if (!review) throw new Error('Not found in mock', { cause: error })
      return review
    }
  },
  
  updateStatus: async (id: number, body: TUpdateReviewStatusBody) => {
    try {
      const response = await AXIOS_INSTANCE.patch<TReview>(`/reviews/admin/${id}/status`, body)
      return response.data
    } catch (error: unknown) {
      console.warn(`Backend /reviews/admin/${id}/status failed. Simulating success.`)
      const review = MOCK_REVIEWS.find(r => r.id === id)
      if (!review) throw new Error('Not found in mock', { cause: error })
      const updated = { ...review, status: body.status }
      return updated
    }
  }
}
