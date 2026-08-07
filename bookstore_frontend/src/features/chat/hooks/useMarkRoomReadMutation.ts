import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { chatQueryKeys } from './chatQueryKeys';

export function useMarkRoomReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatRoomId: number) => {
      const response = await chatService.markRoomRead(chatRoomId);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể đánh dấu đã đọc');
      }
      return response.data;
    },
    onSuccess: (_, chatRoomId) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.messages(chatRoomId) });
    },
  });
}
