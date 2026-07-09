package com.bookstore.dto.product;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookRequest {
    @NotBlank(message = "Book name is required")
    String name;

    @NotBlank(message = "ISBN is required")
    String isbn;

    @NotBlank(message = "Author is required")
    String author;

    String description;

    @Min(value = 0, message = "Quantity in stock must be at least 0")
    int quantityInStock;

    String publisher;

    Integer publishYear;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be at least 0")
    BigDecimal price;

    Integer pageCount;

    boolean isVip;
}
