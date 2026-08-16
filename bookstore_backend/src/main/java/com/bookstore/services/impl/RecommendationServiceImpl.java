package com.bookstore.services.impl;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.bookstore.dto.product.BookResponse;
import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.bookstore.services.RecommendationService;


@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final BookRepo bookRepo;
    private final com.bookstore.repository.UserGenrePreferenceRepo userGenrePreferenceRepo;
    private final RestTemplate restTemplate;

    @Value("${RECOMMENDATION_SERVICE_URL:http://localhost:8000}")
    private String recommendationServiceUrl;

    public RecommendationServiceImpl(BookRepo bookRepo, com.bookstore.repository.UserGenrePreferenceRepo userGenrePreferenceRepo) {
        this.bookRepo = bookRepo;
        this.userGenrePreferenceRepo = userGenrePreferenceRepo;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public List<BookResponse> recommendForUser(int userId, int limit) {
        try {
            String url = UriComponentsBuilder.fromUriString(recommendationServiceUrl)
                    .path("/recommend")
                    .queryParam("user_id", userId)
                    .queryParam("limit", limit)
                    .toUriString();

            BookResponse[] response = restTemplate.getForObject(url, BookResponse[].class);
            if (response != null && response.length > 0) {
                return List.of(response);
            }
        } catch (Exception e) {
            System.err.println("Error calling recommendation service: " + e.getMessage());
        }

        // Fallback: Check if user has preferred genres
        List<Integer> preferredGenreIds = userGenrePreferenceRepo.findGenreIdsByUserId(userId);
        if (preferredGenreIds != null && !preferredGenreIds.isEmpty()) {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "buyCount", "avgRating"));
            List<BookResponse> preferredBooks = bookRepo.findByGenreIds(preferredGenreIds, pageable)
                    .map(BookResponse::toBookResponse).getContent();
            if (!preferredBooks.isEmpty()) {
                return preferredBooks;
            }
        }

        // Default Fallback: return popular books
        return getFallbackPopularBooks(limit);
    }

    @Override
    public List<BookResponse> recommendSimilarItems(int bookId, int limit) {
        try {
            String url = UriComponentsBuilder.fromUriString(recommendationServiceUrl)
                    .path("/similar")
                    .queryParam("item_id", bookId)
                    .queryParam("limit", limit)
                    .toUriString();

            BookResponse[] response = restTemplate.getForObject(url, BookResponse[].class);
            if (response != null) {
                return List.of(response);
            }
        } catch (Exception e) {
            System.err.println("Error calling recommendation service: " + e.getMessage());
        }

        // Fallback: return popular books excluding the current book
        return getFallbackPopularBooksExcluding(bookId, limit);
    }


    private List<BookResponse> getFallbackPopularBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "buyCount", "avgRating"));
        return bookRepo.findAll(pageable).map(BookResponse::toBookResponse).getContent();
    }

    private List<BookResponse> getFallbackPopularBooksExcluding(int bookId, int limit) {
        Pageable pageable = PageRequest.of(0, limit + 1, Sort.by(Sort.Direction.DESC, "buyCount", "avgRating"));
        List<BookResponse> books = bookRepo.findAll(pageable).map(BookResponse::toBookResponse).getContent();
        return books.stream()
                .filter(b -> b.getBookId() != bookId)
                .limit(limit)
                .collect(Collectors.toList());
    }
}
