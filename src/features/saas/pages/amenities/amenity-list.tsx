import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { amenitiesApi, type IAmenityDTO } from '@/shared/api/amenities'

export function AmenityListPage() {
  const [amenities, setAmenities] = useState<IAmenityDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await amenitiesApi.list()
        setAmenities(response.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách tiện ích', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAmenities()
  }, [])

  return (
    <div className="p-page-padding-mobile md:p-page-padding-desktop animate-in fade-in flex h-full w-full flex-col duration-500">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="bg-primary-container text-on-primary-container flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <span className="material-symbols-outlined text-headline-sm font-headline-sm">category</span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Danh mục tiện ích</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Quản lý và cấu hình tiện ích toàn hệ thống cho Landlord
            </p>
          </div>
        </div>
        <Link
          to="/admin/tien-ich/tao-moi"
          className="bg-primary text-on-primary font-label-md text-label-md hover:bg-on-primary-fixed flex h-10 items-center justify-center gap-2 rounded-lg px-6 whitespace-nowrap shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm tiện ích mới
        </Link>
      </div>

      <div className="bg-surface border-surface-border mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined text-outline absolute top-1/2 left-3 -translate-y-1/2">
            search
          </span>
          <input
            className="bg-surface-container-low border-surface-border text-body-md font-body-md text-on-surface focus:ring-primary h-10 w-full rounded-lg border pr-4 pl-10 transition-shadow focus:border-transparent focus:ring-2 focus:outline-none"
            placeholder="Tìm kiếm tên tiện ích..."
            type="text"
          />
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <button className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 transition-colors md:flex-none">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Bộ lọc
          </button>
          <button className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 transition-colors md:flex-none">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất dữ liệu
          </button>
        </div>
      </div>

      <div className="bg-surface border-surface-border flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low border-surface-border border-b">
                <th className="font-label-md text-label-md text-on-surface-variant w-[80px] px-6 py-4 text-center">
                  Icon
                </th>
                <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Tên tiện ích</th>
                <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4">Trạng thái</th>
                <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 text-right">
                  Phòng sử dụng
                </th>
                <th className="font-label-md text-label-md text-on-surface-variant w-[120px] px-6 py-4 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-surface-border divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined text-primary animate-spin text-[32px]">
                      progress_activity
                    </span>
                  </td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-on-surface-variant p-8 text-center">
                    <span className="material-symbols-outlined mb-2 text-[48px] opacity-50">category</span>
                    <p>Chưa có tiện ích nào</p>
                  </td>
                </tr>
              ) : (
                amenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-surface-container-lowest group transition-colors">
                    <td className="flex justify-center px-6 py-4">
                      <div className="bg-primary-fixed/20 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {amenity.icon || 'star'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-md text-body-md text-on-surface font-semibold">{amenity.name}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{amenity.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
                        <span className="bg-tertiary h-1.5 w-1.5 rounded-full"></span>
                        Hoạt động
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-body-md text-body-md text-on-surface font-medium">-</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">phòng</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to={`/admin/tien-ich/${amenity.id}/chinh-sua`}
                          className="text-on-surface-variant hover:bg-surface-container hover:text-primary flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button className="text-on-surface-variant hover:bg-error-container hover:text-error flex h-8 w-8 items-center justify-center rounded-full transition-colors">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
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
