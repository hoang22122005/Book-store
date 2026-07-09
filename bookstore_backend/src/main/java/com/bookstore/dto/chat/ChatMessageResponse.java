package com.bookstore.dto.chat;

import java.time.LocalDateTime;

import com.bookstore.models.ChatMessage;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageResponse {
    private int messageId;
    private int chatRoomId;
    private int senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private boolean read;
    private LocalDateTime createdAt;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .chatRoomId(message.getChatRoom().getChatRoomId())
                .senderId(message.getSender().getUserId())
                .senderName(message.getSender().getName())
                .senderRole(message.getSender().getRole())
                .content(message.getContent())
                .read(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
