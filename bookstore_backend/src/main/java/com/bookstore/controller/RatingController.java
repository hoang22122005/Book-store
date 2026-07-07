package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.review.RatingResponse;
import com.bookstore.dto.review.RatingRequest;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.RatingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ratings")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RatingResponse>>> getRatings(
            @RequestParam(required = false) Integer bookId,
            @PageableDefault(size = 20, sort = "ratingId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "Ratings fetched successfully",
                ratingService.getRatings(bookId, pageable)));
    }

    @GetMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> getRatingById(@PathVariable int ratingId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rating fetched successfully",
                ratingService.getRatingById(ratingId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RatingResponse>> createRating(@Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rating created successfully",
                ratingService.createRating(currentUser.getUserId(), request)));
    }

    @PutMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> updateRating(
            @PathVariable int ratingId,
            @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Rating updated successfully",
                ratingService.updateRating(ratingId, currentUser.getUserId(), request)));
    }

    @DeleteMapping("/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> deleteRating(@PathVariable int ratingId) {
        ratingService.deleteRating(ratingId, currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Rating deleted successfully", null));
    }
}
