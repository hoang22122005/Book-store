import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { ChatMessageResponse, PageResponse } from '../../../types/api';
import { chatQueryKeys } from './chatQueryKeys';

export function useChatMessages(
  chatRoomId: number | null | undefined,
  page: number = 0,
  size: number = 20,
  enabled = true,
) {
  return useQuery<PageResponse<ChatMessageResponse>, Error>({
    queryKey: chatQueryKeys.messages(chatRoomId ?? undefined, page, size),
    queryFn: async () => {
      if (!chatRoomId) {
        throw new Error('chatRoomId is required');
      }
      const response = await chatService.getMessages(chatRoomId, page, size);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách tin nhắn');
      }
      return response.data.data;
    },
    enabled: enabled && !!chatRoomId,
  });
}
