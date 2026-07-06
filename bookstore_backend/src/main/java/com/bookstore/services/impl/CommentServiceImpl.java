package com.bookstore.services.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.CommentResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.review.CommentRequest;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.Comment;
import com.bookstore.models.User;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.CommentRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.CommentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final BookRepo bookRepo;
    private final UserRepository userRepository;

    @Override
    public PageResponse<CommentResponse> getComments(Integer bookId, Pageable pageable) {
        Page<CommentResponse> comments = bookId == null
                ? commentRepository.findAll(pageable).map(CommentResponse::fromComment)
                : commentRepository.findByBookBookId(bookId, pageable).map(CommentResponse::fromComment);

        return PageResponse.toPageResponse(comments);
    }

    @Override
    public CommentResponse getCommentById(int commentId) {
        return CommentResponse.fromComment(findComment(commentId));
    }

    @Override
    @Transactional
    public CommentResponse createComment(int userId, CommentRequest request) {
        Comment comment = new Comment();
        comment.setBook(findBook(request.getBookId()));
        comment.setUser(findUser(userId));
        comment.setContent(request.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());

        return CommentResponse.fromComment(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public CommentResponse updateComment(int commentId, int userId, CommentRequest request) {
        Comment comment = findComment(commentId);
        ensureCommentOwner(comment, userId);
        comment.setBook(findBook(request.getBookId()));
        comment.setUser(findUser(userId));
        comment.setContent(request.getContent().trim());

        return CommentResponse.fromComment(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(int commentId, int userId) {
        Comment comment = findComment(commentId);
        ensureCommentOwner(comment, userId);
        commentRepository.delete(comment);
    }

    private Comment findComment(int commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay binh luan"));
    }

    private Book findBook(int bookId) {
        return bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach"));
    }

    private User findUser(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));
    }

    private void ensureCommentOwner(Comment comment, int userId) {
        if (comment.getUser().getUserId() != userId) {
            throw new ForbiddenException("Ban khong co quyen thao tac binh luan nay");
        }
    }
}
