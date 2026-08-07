import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import type { ChatRoomResponse } from '../../../types/api';
import { chatQueryKeys } from './chatQueryKeys';

export function useGetOrCreateMyRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation<ChatRoomResponse, Error>({
    mutationFn: async () => {
      const response = await chatService.getOrCreateMyRoom();
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tạo cuộc trò chuyện');
      }
      return response.data.data;
    },
    onSuccess: (room) => {
      queryClient.setQueryData(chatQueryKeys.myRoom(), room);
    },
  });
}
