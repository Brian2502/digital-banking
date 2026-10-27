
package com.brian.digitalbanking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransferResponse(
        String reference,
        String sourceAccountNumber,
        String destinationAccountNumber,
        BigDecimal amount,
        BigDecimal sourceBalanceAfter,
        BigDecimal destinationBalanceAfter,
        LocalDateTime createdAt
) {}
