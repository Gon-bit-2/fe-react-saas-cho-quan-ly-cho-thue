import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, DoorOpen, Megaphone, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { apiClient } from '@/shared/api/axios-client'

type StatusSummary = {
  total: number
  newInRange?: number
  ACTIVE?: number
}

type PlatformSummary = {
  generatedAt: string
  users: StatusSummary
  landlords: StatusSummary
  tenants: StatusSummary & { verified: number }
  properties: StatusSummary
  rooms: StatusSummary & { occupancyRate: number }
  marketplace: { PUBLISHED?: number; publishedInRange: number }
  subscriptions: { active: number; expiringWithin30Days: number }
}

type TrendItem = {
  bucket: string
  newUsers: number
  newLandlords: number
  newTenants: number
  newRooms: number
  publishedListings: number
}

type PlatformTrends = {
  groupBy: 'day' | 'month'
  items: TrendItem[]
}

function lastThirtyDays() {
  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 29)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export const AdminDashboardPage = () => {
  const [range] = useState(lastThirtyDays)
  const summary = useQuery({
    queryKey: ['platform-dashboard', 'summary', range],
    queryFn: () => apiClient.get<PlatformSummary>('/dashboard/platform/summary', { params: range }).then(r => r.data),
  })
  const trends = useQuery({
    queryKey: ['platform-dashboard', 'trends', range],
    queryFn: () => apiClient
      .get<PlatformTrends>('/dashboard/platform/trends', { params: { ...range, groupBy: 'day' } })
      .then(r => r.data),
  })

  const metrics = summary.data ? [
    { label: 'Tổng người dùng', value: summary.data.users.total, detail: `+${summary.data.users.newInRange ?? 0} trong kỳ`, icon: Users },
    { label: 'Chủ trọ', value: summary.data.landlords.total, detail: `${summary.data.landlords.ACTIVE ?? 0} hoạt động`, icon: Building2 },
    { label: 'Tổng phòng', value: summary.data.rooms.total, detail: `${summary.data.rooms.occupancyRate}% đang thuê`, icon: DoorOpen },
    { label: 'Tin đã đăng', value: summary.data.marketplace.PUBLISHED ?? 0, detail: `+${summary.data.marketplace.publishedInRange} trong kỳ`, icon: Megaphone },
  ] : []

  const maxTrend = Math.max(1, ...(trends.data?.items.map(item => Math.max(item.newUsers, item.newRooms, item.publishedListings)) ?? [1]))

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tổng quan nền tảng</h1>
        <p className="mt-1 text-muted-foreground">Dữ liệu từ {range.from} đến {range.to}</p>
      </div>

      {(summary.isError || trends.isError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">Không thể tải dữ liệu dashboard.</div>
      )}

      {summary.isLoading ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">Đang tải số liệu...</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <metric.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{metric.value.toLocaleString('vi-VN')}</p>
                <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">Xu hướng 30 ngày</h2>
              <p className="text-sm text-muted-foreground">Người dùng mới, phòng mới và tin được đăng theo ngày</p>
            </div>
            {summary.data && (
              <div className="text-right text-sm text-muted-foreground">
                <div>{summary.data.subscriptions.active} gói đang hoạt động</div>
                <div>{summary.data.subscriptions.expiringWithin30Days} gói hết hạn trong 30 ngày</div>
              </div>
            )}
          </div>

          {trends.isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Đang tải xu hướng...</div>
          ) : trends.data?.items.length ? (
            <div className="flex h-64 items-end gap-1 overflow-x-auto border-b border-l p-3" aria-label="Biểu đồ xu hướng nền tảng">
              {trends.data.items.map(item => (
                <div key={item.bucket} className="group flex h-full min-w-4 flex-1 items-end gap-px" title={`${new Date(item.bucket).toLocaleDateString('vi-VN')}: ${item.newUsers} user, ${item.newRooms} phòng, ${item.publishedListings} tin`}>
                  <div className="w-1/3 rounded-t bg-primary" style={{ height: `${Math.max(2, item.newUsers / maxTrend * 100)}%` }} />
                  <div className="w-1/3 rounded-t bg-blue-500" style={{ height: `${Math.max(2, item.newRooms / maxTrend * 100)}%` }} />
                  <div className="w-1/3 rounded-t bg-amber-500" style={{ height: `${Math.max(2, item.publishedListings / maxTrend * 100)}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">Chưa có dữ liệu trong khoảng thời gian này.</div>
          )}

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <span><i className="mr-2 inline-block h-3 w-3 rounded bg-primary" />Người dùng mới</span>
            <span><i className="mr-2 inline-block h-3 w-3 rounded bg-blue-500" />Phòng mới</span>
            <span><i className="mr-2 inline-block h-3 w-3 rounded bg-amber-500" />Tin đăng mới</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
