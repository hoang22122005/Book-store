package com.bookstore.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingRequest {
    @NotNull(message = "Book id is required")
    Integer bookId;

    @NotNull(message = "Rating value is required")
    @Min(value = 1, message = "Rating value must be from 1 to 5")
    @Max(value = 5, message = "Rating value must be from 1 to 5")
    Integer ratingValue;
}
