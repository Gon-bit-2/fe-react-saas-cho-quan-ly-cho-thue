import { AXIOS_INSTANCE } from '@/shared/api/axios-client'
import type { TListAdminReviewsQuery, TReview, TUpdateReviewStatusBody } from '../types/reviews.types'



export const reviewsAdminApi = {
  list: async (params?: TListAdminReviewsQuery) => {
    const response = await AXIOS_INSTANCE.get<{ data: TReview[]; total: number }>('/reviews/admin', { params })
    return response.data || { data: [], total: 0 }
  },
  
  getById: async (id: number) => {
    const response = await AXIOS_INSTANCE.get<TReview>(`/reviews/admin/${id}`)
    return response.data
  },
  
  updateStatus: async (id: number, body: TUpdateReviewStatusBody) => {
    const response = await AXIOS_INSTANCE.patch<TReview>(`/reviews/admin/${id}/status`, body)
    return response.data
  }
}
