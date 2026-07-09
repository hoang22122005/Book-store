package com.bookstore.dto.chat;

import java.time.LocalDateTime;

import com.bookstore.models.ChatRoom;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatRoomResponse {
    private int chatRoomId;
    private int buyerId;
    private String buyerName;
    private String status;
    private LocalDateTime createdAt;

    public static ChatRoomResponse from(ChatRoom chatRoom) {
        return ChatRoomResponse.builder()
                .chatRoomId(chatRoom.getChatRoomId())
                .buyerId(chatRoom.getBuyer().getUserId())
                .buyerName(chatRoom.getBuyer().getName())
                .status(chatRoom.getStatus())
                .createdAt(chatRoom.getCreatedAt())
                .build();
    }
}
