package com.bookstore.dto.user;

import com.bookstore.models.enums.AccountStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {
    private AccountStatus status;
    private Boolean isDeleted;
}
