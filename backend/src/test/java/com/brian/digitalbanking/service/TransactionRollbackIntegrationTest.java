
package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.TransferRequest;
import com.brian.digitalbanking.entity.BankAccount;
import com.brian.digitalbanking.entity.Transaction;
import com.brian.digitalbanking.entity.TransactionType;
import com.brian.digitalbanking.entity.User;
import com.brian.digitalbanking.entity.UserRole;
import com.brian.digitalbanking.repository.BankAccountRepository;
import com.brian.digitalbanking.repository.TransactionRepository;
import com.brian.digitalbanking.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.UUID;



@SpringBootTest(properties = {
        "app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
class TransactionRollbackIntegrationTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @MockitoSpyBean
    private TransactionRepository transactionRepositorySpy;

    @Test
    void transfer_shouldRollbackBothBalances_whenSecondTransactionSaveFails() {
        // Tạo account number riêng cho mỗi lần chạy test
        String sourceAccountNumber =
                "99" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);

        String destinationAccountNumber =
                "99" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        // 1. Tạo user test
        User user = new User();
        user.setFullName("Rollback Test User");
        user.setEmail("rollback-test-" + UUID.randomUUID() + "@example.com");
        user.setPassword("test-password");
        user.setRole(UserRole.USER);
        user = userRepository.saveAndFlush(user);

        // 2. Tạo hai tài khoản
        BankAccount source = new BankAccount();
        source.setAccountNumber(sourceAccountNumber);
        source.setBalance(new BigDecimal("500000.00"));
        source.setUser(user);
        source = bankAccountRepository.saveAndFlush(source);

        BankAccount destination = new BankAccount();
        destination.setAccountNumber(destinationAccountNumber);
        destination.setBalance(new BigDecimal("100000.00"));
        destination.setUser(user);
        destination = bankAccountRepository.saveAndFlush(destination);

        Long sourceId = source.getId();
        Long destinationId = destination.getId();

        // 3. Giả lập người dùng đã đăng nhập
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(), "test-password"
                );

        // 4. Gây lỗi ở lần save giao dịch thứ hai
        AtomicInteger saveCount = new AtomicInteger();

        doAnswer(invocation -> {
            if (saveCount.incrementAndGet() == 2) {
                throw new RuntimeException("Simulated transaction save failure");
            }
            return invocation.callRealMethod();
        }).when(transactionRepositorySpy).save(any(Transaction.class));

        TransferRequest request = new TransferRequest(
                sourceAccountNumber,
                destinationAccountNumber,
                new BigDecimal("200000.00")
        );

        try {
            assertThrows(RuntimeException.class,
                    () -> transactionService.transfer(authentication, request));
        } finally {
            reset(transactionRepositorySpy);
        }

        // 5. Đọc lại dữ liệu từ database
        BankAccount actualSource =
                bankAccountRepository.findById(sourceId).orElseThrow();

        BankAccount actualDestination =
                bankAccountRepository.findById(destinationId).orElseThrow();

        assertEquals(0,
                actualSource.getBalance().compareTo(new BigDecimal("500000.00")));

        assertEquals(0,
                actualDestination.getBalance().compareTo(new BigDecimal("100000.00")));

        List<Transaction> savedTransactions =
                transactionRepository.findAll().stream()
                        .filter(t ->
                                t.getAccount().getId().equals(sourceId)
                                        || t.getAccount().getId().equals(destinationId))
                        .filter(t ->
                                t.getType() == TransactionType.TRANSFER_OUT
                                        || t.getType() == TransactionType.TRANSFER_IN)
                        .toList();

        assertTrue(savedTransactions.isEmpty(),
                "No transfer transaction should remain after rollback");
    }
}
