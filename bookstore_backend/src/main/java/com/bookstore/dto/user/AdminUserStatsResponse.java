package com.bookstore.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long lockedUsers;
    private long staffAndAdmins;
    private long vipUsers;
}
