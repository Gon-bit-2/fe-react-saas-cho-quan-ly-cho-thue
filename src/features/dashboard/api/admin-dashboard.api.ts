import { apiClient } from '@/shared/api/axios-client'

export interface DashboardStats {
  totalTenants: number
  totalRenters: number
  totalRevenue: number
  activeSubscriptions: number
  recentTransactions: unknown[]
}

export const adminDashboardApi = {
  getOverview: (params?: Record<string, unknown>) => {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats', { params })
  },
}
