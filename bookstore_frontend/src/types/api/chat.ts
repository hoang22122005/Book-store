import type { DateTime } from './common'

export interface ChatMessageRequest {
  chatRoomId: number
  content: string
}

export interface ChatMessageResponse {
  messageId: number
  chatRoomId: number
  senderId: number
  senderName: string
  senderRole: string
  content: string
  read: boolean
  createdAt: DateTime
}

export interface ChatRoomResponse {
  chatRoomId: number
  buyerId: number
  buyerName: string
  status: string
  createdAt: DateTime
}

export interface ChatWebSocketContract {
  endpoint: '/ws/chat'
  query: {
    token: string
  }
  clientMessage: ChatMessageRequest
  serverMessage: ChatMessageResponse
}
