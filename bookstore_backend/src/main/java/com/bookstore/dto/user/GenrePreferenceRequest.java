package com.bookstore.dto.user;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenrePreferenceRequest {
    @NotEmpty(message = "Danh sách thể loại không được để trống")
    @Size(min = 1, max = 5, message = "Vui lòng chọn từ 1 đến 5 thể loại yêu thích")
    private List<Integer> genreIds;
}
