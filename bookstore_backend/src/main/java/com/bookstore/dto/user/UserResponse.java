package com.bookstore.dto.user;

import com.bookstore.models.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String address;
    private Gender gender;
    private String career;
    private String urlAvt;
}
