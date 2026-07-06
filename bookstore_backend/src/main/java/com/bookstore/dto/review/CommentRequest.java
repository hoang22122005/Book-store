package com.bookstore.dto.review;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentRequest {
    @NotNull(message = "Book id is required")
    Integer bookId;

    @NotBlank(message = "Comment content is required")
    String content;
}
