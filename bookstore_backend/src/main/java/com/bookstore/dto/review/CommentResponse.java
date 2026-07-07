package com.bookstore.dto.review;

import java.time.LocalDateTime;

import com.bookstore.models.Comment;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    int commentId;
    int bookId;
    String bookName;
    int userId;
    String userName;
    String content;
    LocalDateTime createdAt;

    public static CommentResponse toComment(Comment comment) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .bookId(comment.getBook().getBookId())
                .bookName(comment.getBook().getName())
                .userId(comment.getUser().getUserId())
                .userName(comment.getUser().getName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
