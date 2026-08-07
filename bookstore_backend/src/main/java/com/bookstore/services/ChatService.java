package com.bookstore.services;

import java.util.List;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.dto.chat.ChatRoomResponse;

public interface ChatService {
    ChatRoomResponse getOrCreateMyRoom(int userId);

    List<ChatRoomResponse> getRoomsForStaff();

    List<ChatMessageResponse> getMessages(int userId, int chatRoomId);

    PageResponse<ChatMessageResponse> getMessages(int userId, int chatRoomId, Pageable pageable);

    ChatMessageResponse sendMessage(int senderId, int chatRoomId, String content);

    void validateRoomAccess(int userId, int chatRoomId);

    void markRoomRead(int userId, int chatRoomId);

    int getRoomBuyerId(int chatRoomId);
}
