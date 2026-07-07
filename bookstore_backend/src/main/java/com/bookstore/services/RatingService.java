package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.review.RatingResponse;
import com.bookstore.dto.review.RatingRequest;

public interface RatingService {
    PageResponse<RatingResponse> getRatings(Integer bookId, Pageable pageable);
    RatingResponse getRatingById(int ratingId);
    RatingResponse createRating(int userId, RatingRequest request);
    RatingResponse updateRating(int ratingId, int userId, RatingRequest request);
    void deleteRating(int ratingId, int userId);
}
