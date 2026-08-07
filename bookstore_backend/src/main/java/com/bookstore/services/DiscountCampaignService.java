package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.discount.DiscountCampaignRequest;
import com.bookstore.dto.discount.DiscountCampaignResponse;

public interface DiscountCampaignService {
    PageResponse<DiscountCampaignResponse> getCampaigns(Pageable pageable);

    DiscountCampaignResponse getCampaign(long campaignId);

    DiscountCampaignResponse createCampaign(int adminId, DiscountCampaignRequest request);

    DiscountCampaignResponse updateCampaign(long campaignId, DiscountCampaignRequest request);

    DiscountCampaignResponse setCampaignEnabled(long campaignId, boolean enabled);
}
