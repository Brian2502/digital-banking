
package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.AccountResponse;
import com.brian.digitalbanking.entity.AccountStatus;
import com.brian.digitalbanking.entity.BankAccount;
import com.brian.digitalbanking.entity.User;
import com.brian.digitalbanking.repository.BankAccountRepository;
import com.brian.digitalbanking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
public class AccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AccountService(
            BankAccountRepository bankAccountRepository,
            UserRepository userRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getMyAccounts(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return bankAccountRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AccountResponse createAccount(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        BankAccount account = new BankAccount();
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setUser(user);

        BankAccount savedAccount = bankAccountRepository.save(account);

        return toResponse(savedAccount);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private String generateAccountNumber() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder number = new StringBuilder();

            for (int i = 0; i < 12; i++) {
                number.append(secureRandom.nextInt(10));
            }

            String accountNumber = number.toString();

            if (!bankAccountRepository.existsByAccountNumber(accountNumber)) {
                return accountNumber;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Could not generate a unique account number");
    }

    private AccountResponse toResponse(BankAccount account) {
        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }
}
