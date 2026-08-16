import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { apiClient } from '@/shared/api/axios-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SignContractDialog } from '@/features/tenant-app/pages/contracts/components/sign-contract-dialog'
import { SelfServiceDetailDialog } from './components/self-service-detail-dialog'
import { useState } from 'react'

type SelfServiceItem = Record<string, unknown>

type SelfServiceResponse = {
  data: SelfServiceItem[]
  meta?: { total?: number }
}

const sections = {
  'lich-xem-phong': {
    title: 'Lịch xem phòng của tôi',
    endpoint: '/room-viewing-appointments/me',
    empty: 'Bạn chưa có lịch xem phòng nào.',
  },
  'yeu-cau-thue': {
    title: 'Yêu cầu thuê của tôi',
    endpoint: '/rental-requests/me',
    empty: 'Bạn chưa gửi yêu cầu thuê nào.',
  },
  'hop-dong': {
    title: 'Hợp đồng của tôi',
    endpoint: '/contracts/me',
    empty: 'Bạn chưa có hợp đồng nào.',
  },
  'ban-giao': {
    title: 'Biên bản bàn giao của tôi',
    endpoint: '/handovers/me',
    empty: 'Bạn chưa có biên bản bàn giao nào.',
  },
  'hoa-don': {
    title: 'Hóa đơn của tôi',
    endpoint: '/invoices/me',
    empty: 'Bạn chưa có hóa đơn nào.',
  },
  'thanh-toan': {
    title: 'Thanh toán của tôi',
    endpoint: '/payments/me',
    empty: 'Bạn chưa có giao dịch thanh toán nào.',
  },
  'ho-tro': {
    title: 'Yêu cầu hỗ trợ của tôi',
    endpoint: '/tickets/me',
    empty: 'Bạn chưa có yêu cầu hỗ trợ nào.',
  },
} as const

function textValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return undefined
}

function nestedLabel(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as SelfServiceItem
  return textValue(record.title) ?? textValue(record.name) ?? textValue(record.roomCode)
}

function itemTitle(item: SelfServiceItem): string {
  return (
    textValue(item.subject) ??
    textValue(item.contractCode) ??
    textValue(item.invoiceCode) ??
    textValue(item.code) ??
    nestedLabel(item.room) ??
    `#${textValue(item.id) ?? '—'}`
  )
}

function itemDescription(item: SelfServiceItem): string | undefined {
  return nestedLabel(item.property) ?? nestedLabel(item.room) ?? textValue(item.description) ?? textValue(item.note)
}

function itemDate(item: SelfServiceItem): string | undefined {
  const raw =
    textValue(item.scheduledAt) ?? textValue(item.startDate) ?? textValue(item.dueDate) ?? textValue(item.createdAt)
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleString('vi-VN')
}

function itemAmount(item: SelfServiceItem): string | undefined {
  const raw = item.totalAmount ?? item.amount ?? item.basePrice
  const amount = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  return Number.isFinite(amount) ? `${amount.toLocaleString('vi-VN')} ₫` : undefined
}

export function Component() {
  const [detailId, setDetailId] = useState<number | null>(null)
  const location = useLocation()
  const slug = location.pathname.split('/').filter(Boolean).at(-1) as keyof typeof sections
  const section = sections[slug] ?? sections['lich-xem-phong']

  const query = useQuery({
    queryKey: ['account-self-service', section.endpoint],
    queryFn: ({ signal }) =>
      apiClient
        .get<SelfServiceResponse>(section.endpoint, { params: { page: 1, limit: 50 }, signal })
        .then((response) => response.data),
  })

  const cancelItem = useMutation({
    mutationFn: (id: number) => {
      const endpoint =
        slug === 'lich-xem-phong' ? `/room-viewing-appointments/me/${id}/cancel` : `/rental-requests/me/${id}/cancel`
      return apiClient.patch(endpoint, {})
    },
    onSuccess: () => query.refetch(),
  })

  const signContract = useMutation({
    mutationFn: ({ id, signature }: { id: number; signature: string }) => {
      return apiClient.post(`/contracts/me/${id}/sign`, { signature })
    },
    onSuccess: () => query.refetch(),
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">Khu vực tự phục vụ</p>
        <h1 className="text-2xl font-bold text-slate-900">{section.title}</h1>
      </div>

      {query.isLoading && (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
      )}

      {query.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Không thể tải dữ liệu. Vui lòng thử lại sau.
          <button className="ml-2 underline" type="button" onClick={() => void query.refetch()}>
            Thử lại
          </button>
        </div>
      )}

      {!query.isLoading && !query.isError && query.data?.data.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-500">{section.empty}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {query.data?.data.map((item, index) => {
          const status = textValue(item.status)
          const description = itemDescription(item)
          const date = itemDate(item)
          const amount = itemAmount(item)
          const itemId = Number(item.id)
          const canCancel =
            Number.isInteger(itemId) &&
            ((slug === 'lich-xem-phong' && !['REJECTED', 'CANCELED', 'COMPLETED'].includes(status ?? '')) ||
              (slug === 'yeu-cau-thue' && ['PENDING', 'NEED_MORE_INFO'].includes(status ?? '')))
          return (
            <Card key={textValue(item.id) ?? index} className="border-slate-200 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">{itemTitle(item)}</h2>
                  {status && <Badge variant="secondary">{status}</Badge>}
                </div>
                {description && <p className="text-sm text-slate-600">{description}</p>}
                <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-500">
                  {date && <span>{date}</span>}
                  {amount && <strong className="text-slate-800">{amount}</strong>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {Number.isInteger(itemId) && (
                    <Button type="button" size="sm" variant="secondary" onClick={() => setDetailId(itemId)}>
                      Xem chi tiết
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={cancelItem.isPending}
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn hủy mục này?')) cancelItem.mutate(itemId)
                      }}
                    >
                      Hủy
                    </Button>
                  )}
                  {slug === 'hop-dong' && status === 'WAITING_RENTER_SIGN' && (
                    <SignContractDialog
                      title="Khách thuê ký hợp đồng"
                      onSign={(signature) => signContract.mutate({ id: itemId, signature })}
                      isPending={signContract.isPending}
                    >
                      <Button type="button" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        Ký hợp đồng
                      </Button>
                    </SignContractDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <SelfServiceDetailDialog
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        endpoint={section.endpoint}
        id={detailId}
        title={`Chi tiết ${section.title.toLowerCase()}`}
      />
    </div>
  )
}
