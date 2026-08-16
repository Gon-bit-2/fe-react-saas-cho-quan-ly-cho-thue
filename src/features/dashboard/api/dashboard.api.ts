import { apiClient } from '@/shared/api/axios-client'

export type DashboardRangeParams = {
  from?: string
  to?: string
}

export type DashboardSummary = {
  tenantId: number
  range: { from: string; to: string }
  rooms: {
    totalRooms: number
    occupiedRooms: number
    availableRooms: number
    maintenanceRooms: number
    occupancyRate: number
  }
  contracts: {
    totalActive: number
    expiringWithin30Days: number
    newInRange: number
    terminatedInRange: number
  }
  finance: {
    invoiceTotal: number
    paidAmount: number
    pendingPaymentAmount: number
    outstandingDebt: number
    overdueDebt: number
  }
  tickets: {
    open: number
    inProgress: number
    waitingRenter: number
    resolved: number
    closed: number
    urgentOpenTickets: number
  }
}

export type ActionCenterItem = {
  tenantId: number
  pendingRequests: number
  expiringContracts: number
  unpaidInvoices: {
    total: number
    items: Array<{
      id: number
      invoiceCode: string
      debtAmount: number
      daysOverdue: number
      dueDate: string
      room: { id: number; name: string }
      renter: { id: number; fullName: string }
    }>
  }
  openTickets: number
}

export type RevenueTrendParams = DashboardRangeParams & {
  groupBy?: 'day' | 'month'
}

export type RevenueTrend = {
  tenantId: number
  range: { from: string; to: string }
  groupBy: 'day' | 'month'
  items: Array<{
    bucket: string
    amount: number
    count: number
  }>
}

export const getDashboardSummary = async (params?: DashboardRangeParams): Promise<DashboardSummary> => {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', { params })
  return data
}

export const getActionCenter = async (): Promise<ActionCenterItem> => {
  const { data } = await apiClient.get<ActionCenterItem>('/dashboard/action-center')
  return data
}

export const getRevenueTrend = async (params?: RevenueTrendParams): Promise<RevenueTrend> => {
  const { data } = await apiClient.get<RevenueTrend>('/dashboard/revenue-trend', { params })
  return data
}
