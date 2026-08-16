package com.bookstore.dto.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Gender;
import com.bookstore.models.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Integer id;
    private String email;
    private String fullName;
    private Role role;
    private AccountStatus status;
    private String phoneNumber;
    private String address;
    private LocalDate dob;
    private Gender gender;
    private String career;
    private String urlAvt;
    private boolean isVip;
    private LocalDateTime vipExpiration;
    private boolean isDeleted;
    private LocalDateTime createdAt;
}
