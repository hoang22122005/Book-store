import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, ChatMessageResponse, ChatRoomResponse, PageResponse } from '../../../types/api';

export const chatService = {
  getOrCreateMyRoom: () =>
    apiClient.get<ApiResponse<ChatRoomResponse>>('/api/chat/me/room'),

  getRooms: () =>
    apiClient.get<ApiResponse<ChatRoomResponse[]>>('/api/chat/rooms'),

  getMessages: (chatRoomId: number, page: number = 0, size: number = 20) =>
    apiClient.get<ApiResponse<PageResponse<ChatMessageResponse>>>(
      `/api/chat/rooms/${chatRoomId}/messages`,
      { params: { page, size } },
    ),

  markRoomRead: (chatRoomId: number) =>
    apiClient.patch<ApiResponse<void>>(`/api/chat/rooms/${chatRoomId}/read`),
};
