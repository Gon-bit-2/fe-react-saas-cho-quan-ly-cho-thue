export enum AssetCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  NORMAL = 'NORMAL',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export enum HandoverType {
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
}

export enum HandoverStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
}

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
