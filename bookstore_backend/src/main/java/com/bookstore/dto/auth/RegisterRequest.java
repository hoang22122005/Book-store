package com.bookstore.dto.auth;

import com.bookstore.models.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank (message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank (message="Password must be not blank")
    @Size(min=6, message = "Password must be at least 6 characters")
    private String password;


    private LocalDate dob;


    private String address;

    private String phone;

    private Gender gender;

    private String career;
    
}
