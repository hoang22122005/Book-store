package com.bookstore.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findByChatRoomChatRoomIdOrderByCreatedAtAsc(int chatRoomId);
    Page<ChatMessage> findByChatRoomChatRoomId(int chatRoomId, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update chat_message set is_read = true "
            + "where chat_room_id = :chatRoomId "
            + "and sender_id <> :readerId and is_read = false", nativeQuery = true)
    int markMessagesRead(
            @Param("chatRoomId") int chatRoomId,
            @Param("readerId") int readerId);
}
