package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.dto.chat.ChatRoomResponse;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final CurrentUser currentUser;

    @GetMapping("/me/room")
    public ResponseEntity<ApiResponse<ChatRoomResponse>> getOrCreateMyRoom() {
        return ResponseEntity.ok(ApiResponse.success(
                "Chat room fetched successfully",
                chatService.getOrCreateMyRoom(currentUser.getUserId())));
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTOR')")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getRoomsForStaff() {
        return ResponseEntity.ok(ApiResponse.success(
                "Chat rooms fetched successfully",
                chatService.getRoomsForStaff()));
    }

    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(@PathVariable int chatRoomId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Chat messages fetched successfully",
                chatService.getMessages(currentUser.getUserId(), chatRoomId)));
    }
}
