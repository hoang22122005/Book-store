package com.bookstore.dto.product;

import com.bookstore.models.Genre;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreResponse {
    private int genreId;
    private String name;

    public static GenreResponse fromEntity(Genre genre) {
        return GenreResponse.builder()
                .genreId(genre.getGenreId())
                .name(genre.getName())
                .build();
    }
}
