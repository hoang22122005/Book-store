package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.discount.DiscountCampaignRequest;
import com.bookstore.dto.discount.DiscountCampaignResponse;
import com.bookstore.dto.discount.DiscountCampaignStatusRequest;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.DiscountCampaignService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/discount-campaigns")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class DiscountCampaignController {
    private final DiscountCampaignService campaignService;
    private final CurrentUser currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DiscountCampaignResponse>>> getCampaigns(
            @PageableDefault(size = 20, sort = "campaignId", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "Discount campaigns fetched successfully",
                campaignService.getCampaigns(pageable)));
    }

    @GetMapping("/{campaignId}")
    public ResponseEntity<ApiResponse<DiscountCampaignResponse>> getCampaign(
            @PathVariable long campaignId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Discount campaign fetched successfully",
                campaignService.getCampaign(campaignId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiscountCampaignResponse>> createCampaign(
            @Valid @RequestBody DiscountCampaignRequest request) {
        DiscountCampaignResponse response = campaignService.createCampaign(
                currentUser.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Discount campaign created successfully",
                response));
    }

    @PutMapping("/{campaignId}")
    public ResponseEntity<ApiResponse<DiscountCampaignResponse>> updateCampaign(
            @PathVariable long campaignId,
            @Valid @RequestBody DiscountCampaignRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Discount campaign updated successfully",
                campaignService.updateCampaign(campaignId, request)));
    }

    @PatchMapping("/{campaignId}/enabled")
    public ResponseEntity<ApiResponse<DiscountCampaignResponse>> setCampaignEnabled(
            @PathVariable long campaignId,
            @Valid @RequestBody DiscountCampaignStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Discount campaign status updated successfully",
                campaignService.setCampaignEnabled(campaignId, request.getEnabled())));
    }
}
