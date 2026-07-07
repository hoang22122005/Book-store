package com.bookstore.services;

import java.util.List;
import com.bookstore.dto.product.BookResponse;

public interface RecommendationService {
    List<BookResponse> recommendForUser(int userId, int limit);
    List<BookResponse> recommendSimilarItems(int bookId, int limit);
}
