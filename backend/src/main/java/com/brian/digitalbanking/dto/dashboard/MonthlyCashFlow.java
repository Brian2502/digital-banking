package com.brian.digitalbanking.dto.dashboard;

import java.math.BigDecimal;

public record MonthlyCashFlow(
        String month,
        BigDecimal income,
        BigDecimal expense
) {
}