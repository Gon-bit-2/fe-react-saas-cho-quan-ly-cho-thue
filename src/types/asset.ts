export const AssetCondition = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  NORMAL: 'NORMAL',
  DAMAGED: 'DAMAGED',
  LOST: 'LOST',
} as const
export type AssetCondition = (typeof AssetCondition)[keyof typeof AssetCondition]

export const HandoverType = {
  CHECKIN: 'CHECKIN',
  CHECKOUT: 'CHECKOUT',
} as const
export type HandoverType = (typeof HandoverType)[keyof typeof HandoverType]

export const HandoverStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  DISPUTED: 'DISPUTED',
} as const
export type HandoverStatus = (typeof HandoverStatus)[keyof typeof HandoverStatus]

export interface AssetCategory {
  id: number
  tenantId: number
  code: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface RoomAsset {
  id: number
  roomId: number
  categoryId: number
  category?: AssetCategory
  quantity: number
  condition: AssetCondition
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface HandoverAssetItem {
  id: number
  handoverId: number
  categoryId: number
  category?: AssetCategory
  quantity: number
  condition: AssetCondition
  notes?: string
}

export interface HandoverRecord {
  id: number
  version: number
  contractId: number
  roomId: number
  type: HandoverType
  status: HandoverStatus
  handoverDate: string
  notes?: string
  createdById?: number
  items: HandoverAssetItem[]
  createdAt: string
  updatedAt: string
}
