package com.bookstore.dto.user;

import com.bookstore.models.enums.Role;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {
    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
