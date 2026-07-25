package com.bookstore.dto.book;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookAddRequest {
    @NotBlank(message = "Tên sách không được để trống")
    @Size(min = 2, max = 255, message = "Tên sách phải từ 2 đến 255 ký tự")
    private String name;

    @NotBlank(message = "Tên tác giả không được để trống")
    @Size(min = 2, max = 150, message = "Tên tác giả phải từ 2 đến 150 ký tự")
    private String author;

    @NotBlank(message = "Mô tả sách không được để trống")
    @Size(max = 5000, message = "Mô tả sách không được vượt quá 5000 ký tự")
    private String description;

    @NotNull(message = "Số lượng trong kho không được để trống")
    @PositiveOrZero(message = "Số lượng trong kho phải lớn hơn hoặc bằng 0")
    private Integer quantityInStock;

    @NotBlank(message = "Tên nhà xuất bản không được để trống")
    @Size(max = 100, message = "Tên nhà xuất bản không được vượt quá 100 ký tự")
    private String publisher;

    @NotNull(message = "Năm xuất bản không được để trống")
    @Positive(message = "Năm xuất bản phải lớn hơn 0")
    private Integer publishYear;

    @NotNull(message = "Giá tiền không được để trống")
    @Positive(message = "Giá tiền phải lớn hơn 0")
    private BigDecimal price;

    private LocalDateTime createdAt;

    private boolean isVip;

    @NotNull(message = "Số trang không được để trống")
    @Positive(message = "Số trang phải lớn hơn 0")
    private Integer pageCount;

    @NotBlank(message = "Thể loại không được để trống")
    private String genreName;
}
