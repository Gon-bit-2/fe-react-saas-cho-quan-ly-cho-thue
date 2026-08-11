export type TReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
export type TReportTargetType = 'ROOM' | 'TENANT' | 'REVIEW' | 'USER'

export type TReport = {
  id: number
  targetType: TReportTargetType
  targetId: string
  reason: string
  description?: string
  status: TReportStatus
  reporterId: number
  handledBy?: number
  resolutionNote?: string
  createdAt: string
  updatedAt: string
  // Additional frontend-specific helper fields if needed
  reporterName?: string
  handlerName?: string
  targetName?: string
}

export type TListAdminReportsQuery = {
  page?: number
  limit?: number
  status?: TReportStatus
  targetType?: TReportTargetType
  reporterId?: number
  handledBy?: number
  from?: string
  to?: string
  search?: string
}

export type TUpdateReportStatusBody = {
  status: 'REVIEWING' | 'RESOLVED' | 'REJECTED'
  resolutionNote?: string
}
