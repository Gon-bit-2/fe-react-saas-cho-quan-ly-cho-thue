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
  tenantId: number
  roomId: number
  categoryId: number
  category?: AssetCategory
  name: string
  quantity: number
  condition: AssetCondition
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface HandoverAssetItem {
  id: number
  handoverRecordId: number
  roomAssetId: number
  assetName: string
  categoryName: string
  expectedQuantity: number
  actualQuantity: number
  condition: AssetCondition
  note?: string | null
  imageUrl?: string | null
}

export interface HandoverRecord {
  id: number
  version: number
  tenantId: number
  contractId: number
  roomId: number
  type: HandoverType
  status: HandoverStatus
  handoverDate: string
  note?: string | null
  signedByLandlordAt?: string | null
  signedByRenterAt?: string | null
  signedByLandlordId?: number | null
  signedByRenterId?: number | null
  items: HandoverAssetItem[]
  createdAt: string
  updatedAt: string
}
