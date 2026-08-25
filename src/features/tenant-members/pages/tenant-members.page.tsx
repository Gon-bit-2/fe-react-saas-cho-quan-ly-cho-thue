import React from 'react'
import { TenantMembersTable } from '../components/TenantMembersTable'
import { AddMemberModal } from '../components/AddMemberModal'

export const TenantMembersPage: React.FC = () => {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý nhân viên</h2>
        <div className="flex items-center space-x-2">
          <AddMemberModal />
        </div>
      </div>
      <div className="hidden flex-col space-y-4 md:flex">
        <p className="text-muted-foreground">
          Quản lý danh sách nhân viên trong hệ thống của bạn, phân quyền và cấp quyền truy cập.
        </p>
      </div>
      <TenantMembersTable />
    </div>
  )
}

export default TenantMembersPage
