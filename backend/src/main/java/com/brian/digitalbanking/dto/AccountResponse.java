
package com.brian.digitalbanking.dto;

import com.brian.digitalbanking.entity.AccountStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        BigDecimal balance,
        AccountStatus status,
        LocalDateTime createdAt
) {}
