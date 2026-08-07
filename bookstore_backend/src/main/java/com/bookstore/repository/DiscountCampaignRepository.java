package com.bookstore.repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.DiscountCampaign;

public interface DiscountCampaignRepository extends JpaRepository<DiscountCampaign, Long> {
    interface CampaignBookProjection {
        Long getCampaignId();
        Integer getBookId();
    }

    interface ActiveDiscountProjection {
        Integer getBookId();
        Long getCampaignId();
        String getCampaignName();
        java.math.BigDecimal getDiscountPercent();
    }

    @Query(
            value = "select c from DiscountCampaign c join fetch c.createdBy",
            countQuery = "select count(c) from DiscountCampaign c")
    Page<DiscountCampaign> findAllWithCreator(Pageable pageable);

    @Query("""
            select distinct c
            from DiscountCampaign c
            join fetch c.createdBy
            left join fetch c.books
            where c.campaignId = :campaignId
            """)
    Optional<DiscountCampaign> findDetailedById(@Param("campaignId") long campaignId);

    @Query("""
            select c.campaignId as campaignId, b.bookId as bookId
            from DiscountCampaign c
            join c.books b
            where c.campaignId in :campaignIds
            """)
    List<CampaignBookProjection> findBookIdsByCampaignIds(
            @Param("campaignIds") Collection<Long> campaignIds);

    @Query(value = """
            select distinct on (dcb.book_id)
                   dcb.book_id as "bookId",
                   dc.campaign_id as "campaignId",
                   dc.name as "campaignName",
                   dc.discount_percent as "discountPercent"
            from discount_campaign dc
            join discount_campaign_book dcb on dcb.campaign_id = dc.campaign_id
            where dc.enabled = true
              and dc.starts_at <= :now
              and dc.ends_at > :now
              and dcb.book_id in (:bookIds)
            order by dcb.book_id, dc.discount_percent desc, dc.campaign_id desc
            """, nativeQuery = true)
    List<ActiveDiscountProjection> findBestActiveDiscounts(
            @Param("bookIds") Collection<Integer> bookIds,
            @Param("now") OffsetDateTime now);
}
