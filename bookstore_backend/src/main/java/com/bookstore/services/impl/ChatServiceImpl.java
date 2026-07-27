package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.dto.chat.ChatRoomResponse;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.ChatMessage;
import com.bookstore.models.ChatRoom;
import com.bookstore.models.User;
import com.bookstore.models.enums.Role;
import com.bookstore.repository.ChatMessageRepository;
import com.bookstore.repository.ChatRoomRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.ChatService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ChatRoomResponse getOrCreateMyRoom(int userId) {
        ChatRoom chatRoom = chatRoomRepository.findByBuyerUserId(userId)
                .orElseGet(() -> createRoom(userId));

        return ChatRoomResponse.from(chatRoom);
    }

    @Override
    public List<ChatRoomResponse> getRoomsForStaff() {
        return chatRoomRepository.findAll().stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    @Override
    public List<ChatMessageResponse> getMessages(int userId, int chatRoomId) {
        ChatRoom chatRoom = findRoom(chatRoomId);
        User user = findUser(userId);
        ensureRoomAccess(user, chatRoom);

        return chatMessageRepository.findByChatRoomChatRoomIdOrderByCreatedAtAsc(chatRoomId)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(int senderId, int chatRoomId, String content) {
        ChatRoom chatRoom = findRoom(chatRoomId);
        User sender = findUser(senderId);
        ensureRoomAccess(sender, chatRoom);

        ChatMessage message = new ChatMessage();
        message.setChatRoom(chatRoom);
        message.setSender(sender);
        message.setContent(content.trim());
        message.setRead(false);
        message.setCreatedAt(LocalDateTime.now());

        return ChatMessageResponse.from(chatMessageRepository.save(message));
    }

    @Override
    public int getRoomBuyerId(int chatRoomId) {
        return findRoom(chatRoomId).getBuyer().getUserId();
    }

    private ChatRoom createRoom(int buyerId) {
        User buyer = findUser(buyerId);

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setBuyer(buyer);
        chatRoom.setStatus("OPEN");
        chatRoom.setCreatedAt(LocalDateTime.now());

        return chatRoomRepository.save(chatRoom);
    }

    private ChatRoom findRoom(int chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phong chat"));
    }

    private User findUser(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));
    }

    private void ensureRoomAccess(User user, ChatRoom chatRoom) {
        if (isStaff(user) || chatRoom.getBuyer().getUserId() == user.getUserId()) {
            return;
        }

        throw new ForbiddenException("Ban khong co quyen truy cap phong chat nay");
    }

    private boolean isStaff(User user) {
        var role = user.getRole();
        return role == Role.ADMIN || role == Role.STAFF;
    }
}
