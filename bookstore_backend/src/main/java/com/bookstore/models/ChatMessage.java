package com.bookstore.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_message")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @Id
    @Column(name = "message_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    private String content;

    @Column(name = "is_read")
    private boolean isRead;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
