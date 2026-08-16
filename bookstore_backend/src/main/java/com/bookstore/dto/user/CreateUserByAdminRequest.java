package com.bookstore.dto.user;

import java.time.LocalDate;

import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Gender;
import com.bookstore.models.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserByAdminRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    private String name;

    @NotNull(message = "Vai trò không được để trống")
    private Role role;

    private String phone;
    private String address;
    private LocalDate dob;
    private Gender gender;
    private String career;
    private AccountStatus status;
    private Boolean isVip;
}
