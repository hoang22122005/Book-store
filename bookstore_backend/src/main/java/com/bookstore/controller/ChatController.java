package com.bookstore.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
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
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getRoomsForStaff() {
        return ResponseEntity.ok(ApiResponse.success(
                "Chat rooms fetched successfully",
                chatService.getRoomsForStaff()));
    }

    @GetMapping("/rooms/{chatRoomId}/messages")
    public ResponseEntity<ApiResponse<PageResponse<ChatMessageResponse>>> getMessages(
            @PathVariable int chatRoomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
                "Chat messages fetched successfully",
                chatService.getMessages(currentUser.getUserId(), chatRoomId, pageable)));
    }

    @PatchMapping("/rooms/{chatRoomId}/read")
    public ResponseEntity<ApiResponse<Void>> markRoomRead(@PathVariable int chatRoomId) {
        chatService.markRoomRead(currentUser.getUserId(), chatRoomId);
        return ResponseEntity.ok(ApiResponse.success("Chat room marked as read", null));
    }
}
