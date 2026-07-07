package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.product.BookResponse;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.RecommendationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CurrentUser currentUser;

    @GetMapping("/recommendations/user")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getUserRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "100") int topK) {
        
        int userId = currentUser.getUserId();
        // Ensure we retrieve enough items to cover the pagination request
        int limit = Math.max(topK, (page + 1) * size);
        
        List<BookResponse> books = recommendationService.recommendForUser(userId, limit);
        
        int start = Math.min(page * size, books.size());
        int end = Math.min(start + size, books.size());
        List<BookResponse> pageContent = books.subList(start, end);
        
        int totalPages = (int) Math.ceil((double) books.size() / size);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .content(pageContent)
                .page(page)
                .size(size)
                .totalElements(books.size())
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Recommendations fetched successfully", pageResponse));
    }

    @GetMapping("/public/recommendations/similar/{bookId}")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getSimilarRecommendations(
            @PathVariable int bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "100") int topK) {
            
        int limit = Math.max(topK, (page + 1) * size);
        
        List<BookResponse> books = recommendationService.recommendSimilarItems(bookId, limit);
        
        int start = Math.min(page * size, books.size());
        int end = Math.min(start + size, books.size());
        List<BookResponse> pageContent = books.subList(start, end);
        
        int totalPages = (int) Math.ceil((double) books.size() / size);
        
        PageResponse<BookResponse> pageResponse = PageResponse.<BookResponse>builder()
                .content(pageContent)
                .page(page)
                .size(size)
                .totalElements(books.size())
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("Similar books fetched successfully", pageResponse));
    }
}
