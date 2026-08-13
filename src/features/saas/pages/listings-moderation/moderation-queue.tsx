import { useState } from 'react'
import { Link } from 'react-router'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useAdminModerationRooms } from '@/shared/api/admin'

export function ModerationQueuePage() {
  const [params] = useState({ page: 1, limit: 12 })
  const { data: response, isLoading: loading } = useAdminModerationRooms(params)
  
  const listings = response?.data || []

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="bg-primary-container/10 text-primary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            Chờ duyệt
          </span>
        )
      case 'PUBLISHED':
        return (
          <span className="bg-tertiary-container/10 text-tertiary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            Đã duyệt
          </span>
        )
      case 'REJECTED':
        return (
          <span className="bg-error-container/20 text-error inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            Từ chối
          </span>
        )
      case 'HIDDEN':
        return (
          <span className="bg-status-warning/10 text-status-warning inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            Bị ẩn
          </span>
        )
      default:
        return (
          <span className="bg-surface-variant text-on-surface-variant inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            Bản nháp
          </span>
        )
    }
  }

  return (
    <div className="font-body-md text-on-background p-page-padding-mobile md:p-page-padding-desktop animate-in fade-in flex w-full flex-col duration-500">
      <div className="mb-gap-sections">
        <h1 className="font-display text-display text-text-main">Hàng chờ kiểm duyệt tin phòng</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-3xl">
          Quản lý và phê duyệt các tin đăng phòng từ các tenant trên marketplace.
        </p>
      </div>

      <div className="mb-gap-sections grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-surface-container flex items-center justify-between rounded-xl p-6 shadow-sm">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 tracking-wider uppercase">
              Chờ duyệt (Pending)
            </p>
            <p className="font-headline-lg text-headline-lg text-text-main tabular-nums">12</p>
          </div>
          <div className="bg-status-warning/10 text-status-warning flex h-12 w-12 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
          </div>
        </div>
        <div className="bg-surface-container flex items-center justify-between rounded-xl p-6 shadow-sm">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 tracking-wider uppercase">
              Đã duyệt hôm nay
            </p>
            <p className="font-headline-lg text-headline-lg text-text-main tabular-nums">45</p>
          </div>
          <div className="bg-tertiary-container/10 text-tertiary flex h-12 w-12 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
        </div>
        <div className="bg-surface-container flex items-center justify-between rounded-xl p-6 shadow-sm">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 tracking-wider uppercase">
              Từ chối (Rejected)
            </p>
            <p className="font-headline-lg text-headline-lg text-text-main tabular-nums">3</p>
          </div>
          <div className="bg-error-container/20 text-error flex h-12 w-12 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-2xl">cancel</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest mb-8 overflow-hidden rounded-xl shadow-sm">
        <div className="bg-surface-container-low flex flex-col items-end justify-between gap-4 p-6 md:flex-row md:items-center">
          <div className="relative w-full flex-1 md:w-auto">
            <span className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2">
              search
            </span>
            <input
              className="bg-surface-container-lowest font-body-md text-text-main placeholder:text-outline-variant focus:ring-primary/20 h-10 w-full rounded-lg pr-4 pl-10 transition-shadow focus:ring-2 focus:outline-none"
              placeholder="Tìm kiếm theo Tên phòng/Tenant..."
              type="text"
            />
          </div>
          <div className="flex w-full flex-wrap gap-4 md:w-auto">
            <div className="relative">
              <select className="bg-surface-container-lowest font-label-md text-text-main focus:ring-primary/20 h-10 cursor-pointer appearance-none rounded-lg pr-10 pl-4 focus:ring-2 focus:outline-none">
                <option>Tất cả trạng thái</option>
                <option>Chờ duyệt</option>
                <option>Đã duyệt</option>
                <option>Từ chối</option>
                <option>Bị ẩn</option>
              </select>
              <span className="material-symbols-outlined text-on-surface-variant pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                expand_more
              </span>
            </div>
            <button className="bg-surface-container-lowest font-label-md text-text-main hover:bg-surface-container-highest flex h-10 items-center gap-2 rounded-lg px-4 transition-colors">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Khoảng thời gian</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low border-surface-border text-on-surface-variant font-label-md border-y">
                <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap uppercase">Hình ảnh</th>
                <th className="min-w-[250px] px-6 py-4 font-semibold tracking-wider uppercase">Tên phòng</th>
                <th className="px-6 py-4 font-semibold tracking-wider uppercase">Tenant (Chủ trọ)</th>
                <th className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap uppercase">Ngày gửi</th>
                <th className="px-6 py-4 font-semibold tracking-wider uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-surface-border divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-[32px]">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined mb-2 text-[48px] opacity-50">inbox</span>
                    <p>Không có tin đăng nào</p>
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-surface-container-low/50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="bg-surface-variant h-12 w-16 overflow-hidden rounded-md">
                        {listing.images?.[0]?.url ? (
                          <img className="h-full w-full object-cover" src={listing.images[0].url} alt="Room thumbnail" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant flex h-full w-full items-center justify-center opacity-50">
                            image
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-label-md text-text-main px-6 py-4">{listing.title}</td>
                    <td className="text-on-surface-variant px-6 py-4">{listing.property?.name || 'N/A'}</td>
                    <td className="text-on-surface-variant px-6 py-4 tabular-nums">
                      {formatDistanceToNow(new Date(listing.createdAt || new Date()), { addSuffix: true, locale: vi })}
                    </td>
                    <td className="px-6 py-4">{getStatusDisplay(listing.marketplaceStatus || 'DRAFT')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/kiem-duyet/chi-tiet/${listing.id}`}
                        className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-surface-border text-on-surface-variant font-label-sm flex items-center justify-between border-t p-4">
          <span>Hiển thị 1 đến 3 của 12 mục</span>
          <div className="flex items-center gap-1">
            <button
              className="hover:bg-surface-container-highest flex h-8 w-8 items-center justify-center rounded transition-colors disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded font-medium">
              1
            </button>
            <button className="hover:bg-surface-container-highest flex h-8 w-8 items-center justify-center rounded transition-colors">
              2
            </button>
            <button className="hover:bg-surface-container-highest flex h-8 w-8 items-center justify-center rounded transition-colors">
              3
            </button>
            <button className="hover:bg-surface-container-highest flex h-8 w-8 items-center justify-center rounded transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
