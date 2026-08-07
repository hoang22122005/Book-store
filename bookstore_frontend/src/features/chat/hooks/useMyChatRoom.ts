import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { tokenStorage } from '../../../utils';
import type { ChatRoomResponse } from '../../../types/api';
import { chatQueryKeys } from './chatQueryKeys';

export function useMyChatRoom(enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery<ChatRoomResponse, Error>({
    queryKey: chatQueryKeys.myRoom(),
    queryFn: async () => {
      const response = await chatService.getOrCreateMyRoom();
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tạo cuộc trò chuyện');
      }
      return response.data.data;
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
