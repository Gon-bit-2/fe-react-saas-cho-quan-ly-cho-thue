export type TicketCategory =
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'FURNITURE'
  | 'SECURITY'
  | 'CLEANING'
  | 'OTHER'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_RENTER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELED'

export interface TicketRoom {
  id: number
  name: string
}

export interface TicketContract {
  id: number
}

export interface TicketUser {
  id: number
  fullName: string
  avatarUrl?: string | null
  email?: string
  phone?: string | null
}

export interface TicketSummary {
  id: number
  tenantId: number
  roomId: number
  contractId: number | null
  createdById: number
  updatedById: number | null
  assignedTo: number | null
  title: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  resolvedAt: string | null
  room: TicketRoom
  contract: TicketContract | null
  assignedToUser: TicketUser | null
  createdBy: TicketUser
  commentCount: number
  attachmentCount: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface TicketDetail extends TicketSummary {
  description: string
}

export interface TicketComment {
  id: number
  ticketId: number
  userId: number
  content: string
  isInternal: boolean
  user: TicketUser
  attachments: {
    id: number
    url: string
    name: string
    type: string
  }[]
  createdAt: string
  updatedAt: string
}
