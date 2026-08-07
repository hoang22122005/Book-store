import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { tokenStorage } from '../../../utils';
import type { ChatRoomResponse } from '../../../types/api';
import { chatQueryKeys } from './chatQueryKeys';

export function useChatRooms(enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery<ChatRoomResponse[], Error>({
    queryKey: chatQueryKeys.rooms(),
    queryFn: async () => {
      const response = await chatService.getRooms();
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách cuộc trò chuyện');
      }
      return response.data.data;
    },
    enabled: enabled && !!token,
    staleTime: 30 * 1000,
  });
}
