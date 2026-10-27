
package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.TransferRequest;
import com.brian.digitalbanking.entity.BankAccount;
import com.brian.digitalbanking.entity.User;
import com.brian.digitalbanking.repository.BankAccountRepository;
import com.brian.digitalbanking.repository.TransactionRepository;
import com.brian.digitalbanking.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    @Test
    void transfer_shouldNotChangeBalances_whenDestinationAccountNotFound() {
        BankAccountRepository accountRepository =
                mock(BankAccountRepository.class);
        TransactionRepository transactionRepository =
                mock(TransactionRepository.class);
        UserRepository userRepository = mock(UserRepository.class);

        TransactionService service = new TransactionService(
                accountRepository,
                transactionRepository,
                userRepository
        );

        Authentication authentication = mock(Authentication.class);
        User user = mock(User.class);

        when(authentication.getName()).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(1L);

        BankAccount source = mock(BankAccount.class);
        when(source.getAccountNumber()).thenReturn("111111111111");
        when(source.getUser()).thenReturn(user);
        when(source.getStatus())
                .thenReturn(com.brian.digitalbanking.entity.AccountStatus.ACTIVE);
        when(source.getBalance()).thenReturn(new BigDecimal("500000.00"));

        when(accountRepository
                .findAllByAccountNumberInOrderByAccountNumberAsc(any()))
                .thenReturn(List.of(source));

        TransferRequest request = new TransferRequest(
                "111111111111",
                "222222222222",
                new BigDecimal("100000.00")
        );

        assertThrows(ResponseStatusException.class,
                () -> service.transfer(authentication, request));

        verify(accountRepository, never()).save(any(BankAccount.class));
        verify(transactionRepository, never()).save(any());
    }
}
