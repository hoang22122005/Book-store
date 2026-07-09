package com.bookstore.services;

import java.util.List;

import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.dto.chat.ChatRoomResponse;

public interface ChatService {
    ChatRoomResponse getOrCreateMyRoom(int userId);

    List<ChatRoomResponse> getRoomsForStaff();

    List<ChatMessageResponse> getMessages(int userId, int chatRoomId);

    ChatMessageResponse sendMessage(int senderId, int chatRoomId, String content);

    int getRoomBuyerId(int chatRoomId);
}
