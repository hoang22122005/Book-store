package com.bookstore.services.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.common.response.RatingResponse;
import com.bookstore.dto.review.RatingRequest;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.Rating;
import com.bookstore.models.User;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.RatingRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.RatingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {
    private final RatingRepository ratingRepository;
    private final BookRepo bookRepo;
    private final UserRepository userRepository;

    @Override
    public PageResponse<RatingResponse> getRatings(Integer bookId, Pageable pageable) {
        Page<RatingResponse> ratings = bookId == null
                ? ratingRepository.findAll(pageable).map(RatingResponse::fromRating)
                : ratingRepository.findByBookBookId(bookId, pageable).map(RatingResponse::fromRating);

        return PageResponse.toPageResponse(ratings);
    }

    @Override
    public RatingResponse getRatingById(int ratingId) {
        return RatingResponse.fromRating(findRating(ratingId));
    }

    @Override
    @Transactional
    public RatingResponse createRating(int userId, RatingRequest request) {
        if (ratingRepository.existsByBookBookIdAndUserUserId(request.getBookId(), userId)) {
            throw new ConflictException("User already rated this book");
        }

        Rating rating = new Rating();
        rating.setBook(findBook(request.getBookId()));
        rating.setUser(findUser(userId));
        rating.setRatingValue(request.getRatingValue());

        Rating savedRating = ratingRepository.save(rating);
        updateBookRatingSummary(savedRating.getBook().getBookId());
        return RatingResponse.fromRating(savedRating);
    }

    @Override
    @Transactional
    public RatingResponse updateRating(int ratingId, int userId, RatingRequest request) {
        Rating rating = findRating(ratingId);
        ensureRatingOwner(rating, userId);

        ratingRepository.findByBookBookIdAndUserUserId(request.getBookId(), userId)
                .filter(existingRating -> existingRating.getRatingId() != ratingId)
                .ifPresent(existingRating -> {
                    throw new ConflictException("User already rated this book");
                });

        int oldBookId = rating.getBook().getBookId();
        rating.setBook(findBook(request.getBookId()));
        rating.setUser(findUser(userId));
        rating.setRatingValue(request.getRatingValue());

        Rating savedRating = ratingRepository.save(rating);
        updateBookRatingSummary(oldBookId);
        updateBookRatingSummary(savedRating.getBook().getBookId());
        return RatingResponse.fromRating(savedRating);
    }

    @Override
    @Transactional
    public void deleteRating(int ratingId, int userId) {
        Rating rating = findRating(ratingId);
        ensureRatingOwner(rating, userId);
        int bookId = rating.getBook().getBookId();
        ratingRepository.delete(rating);
        updateBookRatingSummary(bookId);
    }

    private Rating findRating(int ratingId) {
        return ratingRepository.findById(ratingId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay danh gia"));
    }

    private Book findBook(int bookId) {
        return bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach"));
    }

    private User findUser(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));
    }

    private void ensureRatingOwner(Rating rating, int userId) {
        if (rating.getUser().getUserId() != userId) {
            throw new ForbiddenException("Ban khong co quyen thao tac danh gia nay");
        }
    }

    private void updateBookRatingSummary(int bookId) {
        Book book = findBook(bookId);
        double avgRating = ratingRepository.findAverageRatingByBookId(bookId);
        long cntRating = ratingRepository.countByBookBookId(bookId);

        book.setAvgRating((float) avgRating);
        book.setCntRating((int) cntRating);
        bookRepo.save(book);
    }
}
