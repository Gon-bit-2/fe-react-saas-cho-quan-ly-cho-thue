import { useQuery } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type { DashboardSummary, RevenueTrend, RecentActivity } from '@/features/tenant-app/types'
import { useAuth } from '../hooks/use-auth'

const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  summary: (tenantId: string) => [...DASHBOARD_KEYS.all, 'summary', tenantId] as const,
  revenueTrend: (tenantId: string, params: { from?: string; to?: string; groupBy?: 'day' | 'month' }) =>
    [...DASHBOARD_KEYS.all, 'revenue-trend', tenantId, params] as const,
  recentActivity: (tenantId: string, limit: number) =>
    [...DASHBOARD_KEYS.all, 'recent-activity', tenantId, limit] as const,
}

// Fallback Mock Data
const MOCK_SUMMARY: DashboardSummary = {
  totalRooms: 45,
  availableRooms: 5,
  totalContracts: 38,
  activeContracts: 35,
  totalRevenue: 150000000,
  unpaidInvoices: 12,
  openTickets: 3,
}

const MOCK_REVENUE_TREND: RevenueTrend[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000000) + 1000000,
  }
})

const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: '1',
    type: 'INVOICE',
    title: 'Hóa đơn tháng 8 phòng 101',
    description: 'Đã thanh toán',
    createdAt: new Date().toISOString(),
    status: 'PAID',
  },
  {
    id: '2',
    type: 'TICKET',
    title: 'Hỏng vòi nước phòng 202',
    description: 'Cần sửa chữa gấp',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'OPEN',
  },
  {
    id: '3',
    type: 'PAYMENT',
    title: 'Thanh toán QR PayOS',
    description: '3.500.000đ',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'SUCCESS',
  },
]

export const useDashboardSummary = (from?: string, to?: string) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(tenantId),
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/dashboard/summary', {
        params: { from, to },
        tenantId,
      })

      const summary = {
        totalRooms: data.rooms?.totalRooms || 0,
        availableRooms: data.rooms?.availableRooms || 0,
        totalContracts: (data.contracts?.activeContracts || 0) + (data.contracts?.endingSoonContracts || 0),
        activeContracts: data.contracts?.activeContracts || 0,
        totalRevenue: data.finance?.paidAmount || 0,
        unpaidInvoices: 0,
        openTickets: data.tickets?.open || 0,
      } as DashboardSummary

      if (summary.totalRooms === 0) {
        return MOCK_SUMMARY
      }

      return summary
    },
    enabled: !!tenantId,
  })
}

export const useRevenueTrend = (from?: string, to?: string, groupBy?: 'day' | 'month') => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: DASHBOARD_KEYS.revenueTrend(tenantId, { from, to, groupBy }),
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/dashboard/revenue-trend', {
        params: { from, to, groupBy },
        tenantId,
      })

      const items = (data.items || []).map((item: any) => ({
        date: item.bucket.split('T')[0],
        revenue: item.amount,
      })) as RevenueTrend[]

      if (items.length === 0) {
        return MOCK_REVENUE_TREND
      }

      return items
    },
    enabled: !!tenantId,
  })
}

export const useRecentActivity = (limit = 10) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: DASHBOARD_KEYS.recentActivity(tenantId, limit),
    queryFn: async () => {
      const { data } = await apiClient.get<any>('/dashboard/recent-activity', {
        params: { limit },
        tenantId,
      })

      const items = (data.items || []).map((item: any) => ({
        id: String(item.id),
        type: item.type,
        title: item.title,
        description: item.description,
        createdAt: item.occurredAt,
        status: item.status,
      })) as RecentActivity[]

      if (items.length === 0) {
        return MOCK_RECENT_ACTIVITY
      }

      return items
    },
    enabled: !!tenantId,
  })
}
