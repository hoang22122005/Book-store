package com.bookstore.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatMessageRequest {
    @NotNull
    private Integer chatRoomId;

    @NotBlank
    private String content;
}
