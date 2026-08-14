import { useEffect, useState } from 'react'
import { subscriptionPaymentsApi, type ISubscriptionPaymentDTO } from '@/shared/api/subscription-payments'
import { format } from 'date-fns'

export function PaymentListPage() {
  const [payments, setPayments] = useState<ISubscriptionPaymentDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await subscriptionPaymentsApi.list()
        setPayments(response.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách thanh toán', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="bg-tertiary-container/20 text-tertiary font-label-md text-label-md inline-flex items-center rounded-full px-2.5 py-1">
            <span className="material-symbols-outlined mr-1 text-[14px]">check_circle</span> Thành công
          </span>
        )
      case 'FAILED':
        return (
          <span className="bg-error-container/50 text-on-error-container font-label-md text-label-md inline-flex items-center rounded-full px-2.5 py-1">
            <span className="material-symbols-outlined mr-1 text-[14px]">cancel</span> Thất bại
          </span>
        )
      case 'PENDING':
        return (
          <span className="bg-surface-container-highest text-status-warning font-label-md text-label-md inline-flex items-center rounded-full px-2.5 py-1">
            <span className="material-symbols-outlined mr-1 text-[14px]">pending</span> Đang chờ
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="bg-surface-variant text-on-surface-variant font-label-md text-label-md inline-flex items-center rounded-full px-2.5 py-1">
            <span className="material-symbols-outlined mr-1 text-[14px]">not_interested</span> Đã hủy
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  return (
    <div className="animate-in fade-in p-page-padding-mobile md:p-page-padding-desktop flex h-full w-full flex-col gap-6 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Thanh toán gói dịch vụ</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Quản lý và đối soát các giao dịch subscription của Chủ trọ.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button className="bg-surface text-on-surface hover:bg-surface-container font-label-md text-label-md flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 shadow-sm transition-colors md:w-auto">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-surface flex flex-col gap-2 rounded-xl p-6 shadow-sm">
          <div className="text-on-surface-variant flex items-center justify-between">
            <span className="font-label-md text-label-md tracking-wider uppercase">Tổng doanh thu</span>
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div className="font-display text-display text-on-surface">0đ</div>
          <div className="font-body-md text-body-md text-status-info flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_flat</span>
            <span>Chưa có dữ liệu</span>
          </div>
        </div>
        <div className="bg-surface flex flex-col gap-2 rounded-xl p-6 shadow-sm">
          <div className="text-on-surface-variant flex items-center justify-between">
            <span className="font-label-md text-label-md tracking-wider uppercase">Giao dịch thành công</span>
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div className="font-display text-display text-on-surface">0</div>
          <div className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Chưa có dữ liệu</span>
          </div>
        </div>
        <div className="bg-surface flex flex-col gap-2 rounded-xl p-6 shadow-sm">
          <div className="text-on-surface-variant flex items-center justify-between">
            <span className="font-label-md text-label-md tracking-wider uppercase">Đang chờ xử lý</span>
            <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
          </div>
          <div className="font-display text-display text-status-warning">0</div>
          <div className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
            <span>Chưa có dữ liệu</span>
          </div>
        </div>
        <div className="bg-surface flex flex-col gap-2 rounded-xl p-6 shadow-sm">
          <div className="text-on-surface-variant flex items-center justify-between">
            <span className="font-label-md text-label-md tracking-wider uppercase">Tỷ lệ thành công</span>
            <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          </div>
          <div className="font-display text-display text-on-surface">0%</div>
          <div className="bg-surface-container-high mt-2 h-2 w-full overflow-hidden rounded-full">
            <div className="bg-status-info h-full rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-surface flex flex-col rounded-xl shadow-sm">
        <div className="bg-surface-container-low flex flex-col items-center justify-between gap-4 rounded-t-xl p-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-3 -translate-y-1/2 text-[20px]">
              search
            </span>
            <input
              className="bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:ring-primary font-body-md text-body-md w-full rounded-lg py-2 pr-4 pl-10 shadow-sm focus:ring-2 focus:outline-none"
              placeholder="Tìm kiếm theo mã Ref, Tenant..."
              type="text"
            />
          </div>
          <div className="hide-scrollbar flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
            <select className="bg-surface text-on-surface focus:ring-primary font-body-md text-body-md min-w-[120px] rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:outline-none">
              <option value="">Tất cả gói</option>
            </select>
            <select className="bg-surface text-on-surface focus:ring-primary font-body-md text-body-md min-w-[140px] rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:outline-none">
              <option value="">Trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang chờ</option>
              <option value="FAILED">Thất bại</option>
            </select>
            <button className="bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center justify-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap shadow-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Thêm bộ lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md tracking-wider uppercase">
                <th className="p-4 font-semibold whitespace-nowrap">Mã GD (Ref)</th>
                <th className="p-4 font-semibold whitespace-nowrap">Chủ trọ</th>
                <th className="p-4 font-semibold whitespace-nowrap">Mã gói</th>
                <th className="p-4 text-right font-semibold whitespace-nowrap">Số tiền (VND)</th>
                <th className="p-4 font-semibold whitespace-nowrap">Phương thức</th>
                <th className="p-4 font-semibold whitespace-nowrap">Ngày thanh toán</th>
                <th className="p-4 text-center font-semibold whitespace-nowrap">Trạng thái</th>
                <th className="p-4 font-semibold whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface align-middle">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-[32px]">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined mb-2 text-[48px] opacity-50">inbox</span>
                    <p>Chưa có giao dịch nào</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-surface-container-lowest group border-surface-container-low/50 cursor-pointer border-b transition-colors last:border-0"
                  >
                    <td className="text-on-surface-variant p-4 font-mono whitespace-nowrap">
                      #{payment.transactionCode || payment.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-container text-on-primary-container font-label-md flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold">
                          {payment.tenantId}
                        </div>
                        <div>
                          <div className="max-w-[200px] truncate font-semibold">Tenant {payment.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-secondary-container text-on-secondary-container font-label-md inline-flex items-center gap-1.5 rounded-md px-2.5 py-1">
                        Gói {payment.planId}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-medium whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN').format(payment.amount)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                          {payment.paymentMethod === 'BANK_TRANSFER' ? 'account_balance' : 'credit_card'}
                        </span>
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td className="text-on-surface-variant p-4 whitespace-nowrap">
                      {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">{getStatusDisplay(payment.status)}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full p-2 opacity-0 transition-colors group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
