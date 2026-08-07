package com.bookstore.services.impl;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.discount.DiscountCampaignRequest;
import com.bookstore.dto.discount.DiscountCampaignResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.DiscountCampaign;
import com.bookstore.models.User;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.DiscountCampaignRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.DiscountCampaignService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountCampaignServiceImpl implements DiscountCampaignService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "campaignId");

    private final DiscountCampaignRepository campaignRepository;
    private final BookRepo bookRepo;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DiscountCampaignResponse> getCampaigns(Pageable pageable) {
        Page<DiscountCampaign> campaigns = campaignRepository.findAllWithCreator(limitPageSize(pageable));
        Map<Long, List<Integer>> bookIdsByCampaign = getBookIdsByCampaign(campaigns.getContent());
        Page<DiscountCampaignResponse> responses = campaigns.map(campaign -> toResponse(
                campaign,
                bookIdsByCampaign.getOrDefault(campaign.getCampaignId(), List.of())));
        return PageResponse.toPageResponse(responses);
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCampaignResponse getCampaign(long campaignId) {
        DiscountCampaign campaign = findDetailedCampaign(campaignId);
        return toResponse(campaign, campaign.getBooks().stream().map(Book::getBookId).sorted().toList());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse createCampaign(int adminId, DiscountCampaignRequest request) {
        validateTimeWindow(request);
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin user not found"));
        Set<Book> books = findActiveBooks(request.getBookIds());
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        DiscountCampaign campaign = new DiscountCampaign();
        applyRequest(campaign, request, books);
        campaign.setEnabled(true);
        campaign.setCreatedBy(admin);
        campaign.setCreatedAt(now);
        campaign.setUpdatedAt(now);

        DiscountCampaign saved = campaignRepository.save(campaign);
        return toResponse(saved, books.stream().map(Book::getBookId).sorted().toList());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse updateCampaign(long campaignId, DiscountCampaignRequest request) {
        validateTimeWindow(request);
        DiscountCampaign campaign = findDetailedCampaign(campaignId);
        Set<Book> books = findActiveBooks(request.getBookIds());
        applyRequest(campaign, request, books);
        campaign.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        DiscountCampaign saved = campaignRepository.save(campaign);
        return toResponse(saved, books.stream().map(Book::getBookId).sorted().toList());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse setCampaignEnabled(long campaignId, boolean enabled) {
        DiscountCampaign campaign = findDetailedCampaign(campaignId);
        campaign.setEnabled(enabled);
        campaign.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        DiscountCampaign saved = campaignRepository.save(campaign);
        return toResponse(saved, saved.getBooks().stream().map(Book::getBookId).sorted().toList());
    }

    private DiscountCampaign findDetailedCampaign(long campaignId) {
        return campaignRepository.findDetailedById(campaignId)
                .orElseThrow(() -> new NotFoundException("Discount campaign not found"));
    }

    private Set<Book> findActiveBooks(List<Integer> requestedBookIds) {
        List<Integer> bookIds = requestedBookIds.stream().distinct().toList();
        List<Book> books = bookRepo.findAllByBookIdInAndIsDeletedFalse(bookIds);
        if (books.size() != bookIds.size()) {
            throw new NotFoundException("One or more active books were not found");
        }
        return new LinkedHashSet<>(books);
    }

    private void validateTimeWindow(DiscountCampaignRequest request) {
        if (!request.getEndsAt().isAfter(request.getStartsAt())) {
            throw new BadRequestException("Campaign end time must be after start time");
        }
        if (!request.getEndsAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new BadRequestException("Campaign end time must be in the future");
        }
    }

    private void applyRequest(
            DiscountCampaign campaign,
            DiscountCampaignRequest request,
            Set<Book> books) {
        campaign.setName(request.getName().trim());
        campaign.setDescription(normalizeDescription(request.getDescription()));
        campaign.setDiscountPercent(request.getDiscountPercent());
        campaign.setStartsAt(request.getStartsAt());
        campaign.setEndsAt(request.getEndsAt());
        campaign.getBooks().clear();
        campaign.getBooks().addAll(books);
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private Map<Long, List<Integer>> getBookIdsByCampaign(Collection<DiscountCampaign> campaigns) {
        if (campaigns.isEmpty()) {
            return Map.of();
        }
        List<Long> campaignIds = campaigns.stream().map(DiscountCampaign::getCampaignId).toList();
        return campaignRepository.findBookIdsByCampaignIds(campaignIds).stream()
                .collect(Collectors.groupingBy(
                        DiscountCampaignRepository.CampaignBookProjection::getCampaignId,
                        Collectors.mapping(
                                DiscountCampaignRepository.CampaignBookProjection::getBookId,
                                Collectors.collectingAndThen(Collectors.toList(), ids -> ids.stream().sorted().toList()))));
    }

    private DiscountCampaignResponse toResponse(DiscountCampaign campaign, List<Integer> bookIds) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return DiscountCampaignResponse.builder()
                .campaignId(campaign.getCampaignId())
                .name(campaign.getName())
                .description(campaign.getDescription())
                .discountPercent(campaign.getDiscountPercent())
                .startsAt(campaign.getStartsAt())
                .endsAt(campaign.getEndsAt())
                .enabled(campaign.isEnabled())
                .status(resolveStatus(campaign, now))
                .createdById(campaign.getCreatedBy().getUserId())
                .createdByName(campaign.getCreatedBy().getName())
                .createdAt(campaign.getCreatedAt())
                .updatedAt(campaign.getUpdatedAt())
                .bookIds(bookIds)
                .build();
    }

    private String resolveStatus(DiscountCampaign campaign, OffsetDateTime now) {
        if (!campaign.isEnabled()) {
            return "DISABLED";
        }
        if (now.isBefore(campaign.getStartsAt())) {
            return "SCHEDULED";
        }
        if (!now.isBefore(campaign.getEndsAt())) {
            return "ENDED";
        }
        return "ACTIVE";
    }

    private Pageable limitPageSize(Pageable pageable) {
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : DEFAULT_SORT;
        return PageRequest.of(page, size, sort);
    }
}
