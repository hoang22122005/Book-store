package com.bookstore.dto.review;

import com.bookstore.models.Rating;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingResponse {
    int ratingId;
    int bookId;
    String bookName;
    int userId;
    String userName;
    int ratingValue;

    public static RatingResponse toRating(Rating rating) {
        return RatingResponse.builder()
                .ratingId(rating.getRatingId())
                .bookId(rating.getBook().getBookId())
                .bookName(rating.getBook().getName())
                .userId(rating.getUser().getUserId())
                .userName(rating.getUser().getName())
                .ratingValue(rating.getRatingValue())
                .build();
    }
}
