package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.dashboard.DashboardResponse;
import com.brian.digitalbanking.dto.TransactionResponse;
import com.brian.digitalbanking.entity.BankAccount;
import com.brian.digitalbanking.entity.Transaction;
import com.brian.digitalbanking.entity.User;
import com.brian.digitalbanking.repository.BankAccountRepository;
import com.brian.digitalbanking.repository.TransactionRepository;
import com.brian.digitalbanking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;

    public DashboardService(
            UserRepository userRepository,
            BankAccountRepository bankAccountRepository,
            TransactionRepository transactionRepository
    ) {
        this.userRepository = userRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        List<BankAccount> accounts =
                bankAccountRepository.findByUserId(user.getId());

        BigDecimal totalBalance = BigDecimal.ZERO;

        for (BankAccount account : accounts) {
            totalBalance = totalBalance.add(account.getBalance());
        }

        Page<Transaction> transactionPage =
                transactionRepository.findByAccount_User_IdOrderByCreatedAtDesc(
                        user.getId(),
                        PageRequest.of(
                                0,
                                5,
                                Sort.by(Sort.Direction.DESC, "createdAt")
                        )
                );

        List<TransactionResponse> recentTransactions =
                transactionPage.getContent()
                        .stream()
                        .map(transaction -> new TransactionResponse(
                                transaction.getId(),
                                transaction.getAccount().getAccountNumber(),
                                transaction.getType(),
                                transaction.getAmount(),
                                transaction.getBalanceAfter(),
                                transaction.getDescription(),
                                transaction.getCreatedAt()
                        ))
                        .toList();

        return new DashboardResponse(
                accounts.size(),
                totalBalance,
                recentTransactions
        );
    }
}