package com.bookstore.dto.user;

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
    private String phoneNumber;
    private String address;
    private String gender;
    private String career;
    private String urlAvt;

}
