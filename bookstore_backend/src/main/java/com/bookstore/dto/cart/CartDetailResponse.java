package com.bookstore.dto.cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookstore.dto.discount.ActiveBookDiscount;
import com.bookstore.models.CartDetail;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartDetailResponse {
    int cartId;
    int userId;
    LocalDateTime createdAt;
    int bookId;
    String bookName;
    String author;
    String urlImg;
    BigDecimal price;
    BigDecimal salePrice;
    BigDecimal discountPercent;
    Long activeCampaignId;
    String activeCampaignName;
    int quantity;

    public static CartDetailResponse toCartDetail(CartDetail cartDetail) {
        return toCartDetail(cartDetail, null, cartDetail.getBook().getPrice());
    }

    public static CartDetailResponse toCartDetail(
            CartDetail cartDetail,
            ActiveBookDiscount discount,
            BigDecimal salePrice) {
        return CartDetailResponse.builder()
                .cartId(cartDetail.getCart().getCartId())
                .userId(cartDetail.getCart().getUser().getUserId())
                .createdAt(cartDetail.getCreatedAt())
                .bookId(cartDetail.getBook().getBookId())
                .bookName(cartDetail.getBook().getName())
                .author(cartDetail.getBook().getAuthor())
                .urlImg(cartDetail.getBook().getUrlImg())
                .price(cartDetail.getBook().getPrice())
                .salePrice(salePrice)
                .discountPercent(discount == null ? BigDecimal.ZERO : discount.discountPercent())
                .activeCampaignId(discount == null ? null : discount.campaignId())
                .activeCampaignName(discount == null ? null : discount.campaignName())
                .quantity(cartDetail.getQuantity())
                .build();
    }
}
