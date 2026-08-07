package com.bookstore.websocket;

import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import com.bookstore.dto.chat.ChatMessageRequest;
import com.bookstore.dto.chat.ChatMessageResponse;
import com.bookstore.dto.chat.ChatEventType;
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

    private final Map<Integer, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();
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
        sessionsByUserId.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);

        if (isStaff(role)) {
            onlineStaffUserIds.add(userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        Integer senderId = (Integer) session.getAttributes().get("userId");
        String role = (String) session.getAttributes().get("role");
        if (senderId == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthenticated"));
            return;
        }

        ChatMessageRequest request = objectMapper.readValue(textMessage.getPayload(), ChatMessageRequest.class);
        ChatEventType eventType = request.getType() == null ? ChatEventType.MESSAGE : request.getType();

        if (eventType == ChatEventType.TYPING || eventType == ChatEventType.STOP_TYPING) {
            chatService.validateRoomAccess(senderId, request.getChatRoomId());
            ChatMessageResponse typingMsg = ChatMessageResponse.builder()
                    .type(eventType)
                    .chatRoomId(request.getChatRoomId())
                    .senderId(senderId)
                    .senderRole(role)
                    .build();
            String payload = objectMapper.writeValueAsString(typingMsg);
            if (isStaff(role)) {
                sendToBuyer(typingMsg, payload);
            } else {
                sendToOnlineStaff(payload);
            }
            return;
        }

        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            session.close(CloseStatus.BAD_DATA.withReason("Message content is required"));
            return;
        }
        // xác thực người gửi và nhận và chuyển đối tượng thành json gửi đi là payload
        ChatMessageResponse savedMessage = chatService.sendMessage(senderId, request.getChatRoomId(), content);
        String payload = objectMapper.writeValueAsString(savedMessage);

        if (isStaff(savedMessage.getSenderRole())) {
            sendToBuyer(savedMessage, payload);
            sendToOnlineStaff(payload);
        } else {
            Set<WebSocketSession> senderSessions = sessionsByUserId.get(senderId);
            if (senderSessions != null) {
                for (WebSocketSession s : senderSessions) {
                    sendToSession(s, payload);
                }
            }
            sendToOnlineStaff(payload);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Integer userId = (Integer) session.getAttributes().get("userId");
        if (userId != null) {
            Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionsByUserId.remove(userId);
                    onlineStaffUserIds.remove(userId);
                }
            }
        }
    }

    private void sendToBuyer(ChatMessageResponse message, String payload) {
        int buyerId = chatService.getRoomBuyerId(message.getChatRoomId());
        Set<WebSocketSession> sessions = sessionsByUserId.get(buyerId);
        if (sessions != null) {
            for (WebSocketSession session : sessions) {
                sendToSession(session, payload);
            }
        }
    }

    private void sendToOnlineStaff(String payload) {
        for (Integer staffUserId : onlineStaffUserIds) {
            Set<WebSocketSession> sessions = sessionsByUserId.get(staffUserId);
            if (sessions != null) {
                for (WebSocketSession session : sessions) {
                    sendToSession(session, payload);
                }
            }
        }
    }

    private void sendToSession(WebSocketSession session, String payload) {
        if (session == null || !session.isOpen()) {
            removeSession(session);
            return;
        }

        try {
            synchronized (session) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(payload));
                }
            }
        } catch (Exception exception) {
            removeSession(session);
            try {
                if (session.isOpen()) {
                    session.close(CloseStatus.SERVER_ERROR.withReason("Unable to send message"));
                }
            } catch (Exception ignored) {
                // Session is already unusable.
            }
        }
    }

    private void removeSession(WebSocketSession session) {
        if (session == null) {
            return;
        }

        Integer userId = (Integer) session.getAttributes().get("userId");
        if (userId == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByUserId.remove(userId, sessions);
                onlineStaffUserIds.remove(userId);
            }
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
        return role != null && ("ADMIN".equalsIgnoreCase(role) || "STAFF".equalsIgnoreCase(role));
    }
}
