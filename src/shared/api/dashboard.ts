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



export const useDashboardSummary = (from?: string, to?: string) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(tenantId),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        rooms?: { totalRooms?: number; availableRooms?: number };
        contracts?: { activeContracts?: number; endingSoonContracts?: number };
        finance?: { paidAmount?: number };
        tickets?: { open?: number };
      }>('/dashboard/summary', {
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
      const { data } = await apiClient.get<{ items?: Array<{ bucket: string; amount: number }> }>('/dashboard/revenue-trend', {
        params: { from, to, groupBy },
        tenantId,
      })

      const items = (data.items || []).map((item) => ({
        date: item.bucket.split('T')[0],
        revenue: item.amount,
      })) as RevenueTrend[]

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
      const { data } = await apiClient.get<{ items?: Array<{ id: string | number; type: string; title: string; description: string; occurredAt: string; status: string }> }>('/dashboard/recent-activity', {
        params: { limit },
        tenantId,
      })

      const items = (data.items || []).map((item) => ({
        id: String(item.id),
        type: item.type,
        title: item.title,
        description: item.description,
        createdAt: item.occurredAt,
        status: item.status,
      })) as RecentActivity[]

      return items
    },
    enabled: !!tenantId,
  })
}
