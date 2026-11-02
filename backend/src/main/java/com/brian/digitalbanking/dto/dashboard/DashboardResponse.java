package com.brian.digitalbanking.dto.dashboard;

import com.brian.digitalbanking.dto.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        int totalAccounts,
        BigDecimal totalBalance,
        List<TransactionResponse> recentTransactions,
        List<MonthlyCashFlow> monthlyCashFlow
) {
}