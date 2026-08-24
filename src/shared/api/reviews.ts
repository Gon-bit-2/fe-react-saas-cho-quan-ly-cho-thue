import { useQuery } from '@tanstack/react-query'
import { AXIOS_INSTANCE } from './axios-client'

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'

export interface RoomSnippet {
  id: number
  title: string
  roomCode: string
}

export interface ContractSnippet {
  id: number
  code: string
}

export interface MyReview {
  id: number
  room: RoomSnippet
  contract: ContractSnippet
  rating: number
  content: string | null
  cleanlinessScore: number
  locationScore: number
  priceScore: number
  serviceScore: number
  status: ReviewStatus
  moderationReason: string | null
  moderatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    skip: number
    totalPages: number
  }
}

export const reviewsApi = {
  listMyReviews: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<MyReview>> => {
    const { data } = await AXIOS_INSTANCE.get('/reviews/me', { params })
    return data
  },
}

export const reviewsKeys = {
  all: ['reviews'] as const,
  mine: (params?: Record<string, unknown>) => [...reviewsKeys.all, 'mine', params] as const,
}

export function useMyReviews(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: reviewsKeys.mine(params),
    queryFn: () => reviewsApi.listMyReviews(params),
  })
}
