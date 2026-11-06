import React from 'react'
import { TenantMembersTable } from '../components/TenantMembersTable'
import { AddMemberModal } from '../components/AddMemberModal'

/**
 * Trang quản lý nhân sự và thành viên vận hành trong tổ chức / khu trọ
 * Cho phép phân quyền vai trò (Admin, Quản lý, Kế toán, Kỹ thuật viên) và mời thành viên mới
 */
export const TenantMembersPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhân sự quản lý</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý danh sách nhân viên trong hệ thống, phân chia vai trò và quyền hạn vận hành.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddMemberModal />
        </div>
      </div>

      {/* Main Table */}
      <TenantMembersTable />
    </div>
  )
}

export default TenantMembersPage
