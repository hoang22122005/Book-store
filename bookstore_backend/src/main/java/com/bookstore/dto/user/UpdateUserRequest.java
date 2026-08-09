package com.bookstore.dto.user;

import com.bookstore.models.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    
    private String name;
    private String phone;
    private String address;
    private Gender gender;
    private String career;
    private String urlAvt;
}
