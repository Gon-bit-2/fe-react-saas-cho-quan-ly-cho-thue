import { AXIOS_INSTANCE } from './axios-client'

export type ConversationType = 'ROOM_CHAT' | 'CONTRACT_CHAT' | 'TICKET_CHAT' | 'SUPPORT_CHAT'
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'

export interface CreateConversationRequest {
  type: ConversationType
  tenantId: number
  roomId?: number
  contractId?: number
  ticketId?: number
}

export interface SendMessageRequest {
  messageType?: MessageType
  content?: string
  fileUrl?: string
}

export interface UserSnippet {
  id: number
  fullName: string | null
  email: string
  avatarUrl: string | null
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  messageType: MessageType
  content: string | null
  fileUrl: string | null
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: UserSnippet
}

export interface ConversationParticipant {
  id: number
  conversationId: number
  userId: number
  joinedAt: string
  user: UserSnippet
}

export interface Conversation {
  id: number
  type: ConversationType
  tenantId: number
  roomId: number | null
  contractId: number | null
  ticketId: number | null
  createdAt: string
  updatedAt: string
  participants?: ConversationParticipant[]
  members?: ConversationParticipant[]
  messages: Message[] // usually last 1 message or so, based on backend
}

export const conversationsApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await AXIOS_INSTANCE.get('/conversations')
    return data
  },

  getMessages: async (conversationId: number, skip = 0, take = 50): Promise<Message[]> => {
    const { data } = await AXIOS_INSTANCE.get<{ data: Message[], meta: Record<string, unknown> }>(`/conversations/${conversationId}/messages`, {
      params: { skip, take },
    })
    return data.data
  },

  sendMessage: async (conversationId: number, payload: SendMessageRequest): Promise<Message> => {
    const { data } = await AXIOS_INSTANCE.post(`/conversations/${conversationId}/messages`, payload)
    return data
  },

  markAsRead: async (conversationId: number): Promise<{ success: boolean }> => {
    const { data } = await AXIOS_INSTANCE.post(`/conversations/${conversationId}/read`)
    return data
  },

  findOrCreateConversation: async (payload: CreateConversationRequest): Promise<Conversation> => {
    const { data } = await AXIOS_INSTANCE.post('/conversations', payload)
    return data
  },
}
