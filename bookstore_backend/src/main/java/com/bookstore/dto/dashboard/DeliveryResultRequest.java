package com.bookstore.dto.dashboard;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryResultRequest {
    @NotNull(message = "Ket qua giao hang khong duoc de trong")
    private Boolean successful;
}
