package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.review.CommentResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.review.CommentRequest;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final CurrentUser currentUser;

    @GetMapping("/public/comments")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getComments(
            @RequestParam(required = false) Integer bookId,
            @PageableDefault(size = 20, sort = "commentId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "Comments fetched successfully",
                commentService.getComments(bookId, pageable)));
    }

    @GetMapping("/public/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> getCommentById(@PathVariable int commentId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Comment fetched successfully",
                commentService.getCommentById(commentId)));
    }

    @PostMapping("/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(@Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Comment created successfully",
                commentService.createComment(currentUser.getUserId(), request)));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable int commentId,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Comment updated successfully",
                commentService.updateComment(commentId, currentUser.getUserId(), request)));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable int commentId) {
        commentService.deleteComment(commentId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}
