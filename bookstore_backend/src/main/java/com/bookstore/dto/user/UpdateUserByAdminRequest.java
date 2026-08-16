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
public class UpdateUserByAdminRequest {
    private String name;
    private String phone;
    private String address;
    private LocalDate dob;
    private Gender gender;
    private String career;
    private String urlAvt;
    private Role role;
    private AccountStatus status;
    private Boolean isDeleted;
    private Boolean isVip;
    private LocalDateTime vipExpiration;
}
