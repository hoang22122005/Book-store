package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.CommentResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.review.CommentRequest;

public interface CommentService {
    PageResponse<CommentResponse> getComments(Integer bookId, Pageable pageable);
    CommentResponse getCommentById(int commentId);
    CommentResponse createComment(int userId, CommentRequest request);
    CommentResponse updateComment(int commentId, int userId, CommentRequest request);
    void deleteComment(int commentId, int userId);
}
