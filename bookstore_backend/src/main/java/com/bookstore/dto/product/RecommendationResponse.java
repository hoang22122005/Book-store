package com.bookstore.dto.product;

import lombok.Data;
import java.util.List;

@Data
public class RecommendationResponse {
    private int userId;
    private int itemId;
    private List<RecommendationItem> recommendations;

    @Data
    public static class RecommendationItem {
        private int itemId;
        private double score;
        private double similarity;
    }
}
