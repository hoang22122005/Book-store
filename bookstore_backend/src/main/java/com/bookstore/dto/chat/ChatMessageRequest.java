package com.bookstore.dto.chat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageRequest {
    @NotNull
    private Integer chatRoomId;

    private ChatEventType type = ChatEventType.MESSAGE;

    private String content;
}
