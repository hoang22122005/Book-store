package com.bookstore.websocket;

import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import com.bookstore.dto.chat.ChatMessageRequest;
import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.security.JwtService;
import com.bookstore.services.ChatService;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final JwtService jwtService;
    private final ChatService chatService;
    private final ObjectMapper objectMapper;

    private final Map<Integer, WebSocketSession> sessionsByUserId = new ConcurrentHashMap<>();
    private final Set<Integer> onlineStaffUserIds = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = extractToken(session.getUri());
        if (token == null || !jwtService.isTokenValid(token)) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
            return;
        }

        int userId = jwtService.extractUserId(token);
        String role = jwtService.extractRole(token);

        session.getAttributes().put("userId", userId);
        session.getAttributes().put("role", role);
        sessionsByUserId.put(userId, session);

        if (isStaff(role)) {
            onlineStaffUserIds.add(userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Integer senderId = (Integer) session.getAttributes().get("userId");
        if (senderId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthenticated"));
            return;
        }

        ChatMessageRequest request = objectMapper.readValue(textMessage.getPayload(), ChatMessageRequest.class);
        ChatMessageResponse savedMessage = chatService.sendMessage(senderId, request.getChatRoomId(), request.getContent());
        String payload = objectMapper.writeValueAsString(savedMessage);

        sendToSession(session, payload);
        if (isStaff(savedMessage.getSenderRole())) {
            sendToBuyer(savedMessage, payload);
        } else {
            sendToOnlineStaff(payload);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Integer userId = (Integer) session.getAttributes().get("userId");
        if (userId != null) {
            sessionsByUserId.remove(userId);
            onlineStaffUserIds.remove(userId);
        }
    }

    private void sendToBuyer(ChatMessageResponse message, String payload) throws Exception {
        WebSocketSession buyerSession = sessionsByUserId.get(chatService.getRoomBuyerId(message.getChatRoomId()));
        sendToSession(buyerSession, payload);
    }

    private void sendToOnlineStaff(String payload) throws Exception {
        for (Integer staffUserId : onlineStaffUserIds) {
            sendToSession(sessionsByUserId.get(staffUserId), payload);
        }
    }

    private void sendToSession(WebSocketSession session, String payload) throws Exception {
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(payload));
        }
    }

    private String extractToken(URI uri) {
        if (uri == null) {
            return null;
        }

        return UriComponentsBuilder.fromUri(uri)
                .build()
                .getQueryParams()
                .getFirst("token");
    }

    private boolean isStaff(String role) {
        return role != null && ("ADMIN".equalsIgnoreCase(role) || "INVENTOR".equalsIgnoreCase(role));
    }
}
