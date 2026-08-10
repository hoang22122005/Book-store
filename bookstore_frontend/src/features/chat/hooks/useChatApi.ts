import { useCallback } from 'react';
import { chatService } from '../services/chatService';

export function useChatApi() {
  const getOrCreateMyRoom = useCallback(async () => {
    const response = await chatService.getOrCreateMyRoom();
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không thể tạo cuộc trò chuyện');
    }
    return response.data.data;
  }, []);

  const getRooms = useCallback(async () => {
    const response = await chatService.getRooms();
    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể tải danh sách cuộc trò chuyện');
    }
    return response.data.data || [];
  }, []);

  const getMessages = useCallback(async (chatRoomId: number, page = 0, size = 20) => {
    const response = await chatService.getMessages(chatRoomId, page, size);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không thể tải danh sách tin nhắn');
    }
    return response.data.data;
  }, []);

  const markRoomRead = useCallback(async (chatRoomId: number) => {
    const response = await chatService.markRoomRead(chatRoomId);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể đánh dấu đã đọc');
    }
  }, []);

  return { getOrCreateMyRoom, getRooms, getMessages, markRoomRead };
}
