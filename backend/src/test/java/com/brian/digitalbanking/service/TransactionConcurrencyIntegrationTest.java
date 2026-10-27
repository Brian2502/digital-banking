
package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.TransferRequest;
import com.brian.digitalbanking.entity.AccountStatus;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
})
class TransactionConcurrencyIntegrationTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void concurrentTransfers_shouldAllowOnlyOneSuccessfulTransfer()
            throws Exception {

        // 1. Tạo dữ liệu kiểm thử riêng
        String uniqueId = UUID.randomUUID().toString();

        User user = new User();
        user.setFullName("Concurrency Test User");
        user.setEmail("concurrency-" + uniqueId + "@example.com");
        user.setPassword("test-password");
        user.setRole(UserRole.USER);

        user = userRepository.saveAndFlush(user);

        String sourceNumber = generateAccountNumber();
        String destinationNumber = generateAccountNumber();

        BankAccount source = new BankAccount();
        source.setAccountNumber(sourceNumber);
        source.setBalance(new BigDecimal("350000.00"));
        source.setStatus(AccountStatus.ACTIVE);
        source.setUser(user);
        source = bankAccountRepository.saveAndFlush(source);

        BankAccount destination = new BankAccount();
        destination.setAccountNumber(destinationNumber);
        destination.setBalance(new BigDecimal("100000.00"));
        destination.setStatus(AccountStatus.ACTIVE);
        destination.setUser(user);
        destination = bankAccountRepository.saveAndFlush(destination);

        Long sourceId = source.getId();
        Long destinationId = destination.getId();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(), "test-password"
                );

        TransferRequest request = new TransferRequest(
                sourceNumber,
                destinationNumber,
                new BigDecimal("250000.00")
        );

        // 2. Đồng bộ để hai luồng cùng bắt đầu chuyển tiền
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            var task = (java.util.concurrent.Callable<Boolean>) () -> {
                ready.countDown();

                if (!start.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException(
                            "Timed out waiting for concurrent start"
                    );
                }

                try {
                    transactionService.transfer(authentication, request);
                    return true;
                } catch (ResponseStatusException exception) {
                    // Một request phải bị từ chối vì không đủ số dư
                    return false;
                }
            };

            Future<Boolean> first = executor.submit(task);
            Future<Boolean> second = executor.submit(task);

            assertTrue(
                    ready.await(10, TimeUnit.SECONDS),
                    "Both requests should be ready"
            );

            // Cho phép hai request bắt đầu gần như cùng lúc
            start.countDown();

            boolean firstSucceeded = first.get(30, TimeUnit.SECONDS);
            boolean secondSucceeded = second.get(30, TimeUnit.SECONDS);

            // 3. Chỉ một request được chuyển tiền thành công
            assertNotEquals(
                    firstSucceeded,
                    secondSucceeded,
                    "Exactly one transfer should succeed"
            );

        } finally {
            start.countDown();
            executor.shutdownNow();
        }

        // 4. Đọc lại dữ liệu sau khi cả hai transaction hoàn tất
        BankAccount actualSource =
                bankAccountRepository.findById(sourceId).orElseThrow();

        BankAccount actualDestination =
                bankAccountRepository.findById(destinationId).orElseThrow();

        assertEquals(
                0,
                actualSource.getBalance()
                        .compareTo(new BigDecimal("100000.00")),
                "Source balance should be 100000"
        );

        assertEquals(
                0,
                actualDestination.getBalance()
                        .compareTo(new BigDecimal("350000.00")),
                "Destination balance should be 350000"
        );

        // 5. Kiểm tra lịch sử giao dịch
        List<Transaction> transactions = transactionRepository.findAll()
                .stream()
                .filter(t ->
                        t.getAccount().getId().equals(sourceId)
                                || t.getAccount().getId().equals(destinationId))
                .filter(t ->
                        t.getType() == TransactionType.TRANSFER_OUT
                                || t.getType() == TransactionType.TRANSFER_IN)
                .toList();

        assertEquals(
                2,
                transactions.size(),
                "Only one successful transfer should create two records"
        );

        assertEquals(
                1,
                transactions.stream()
                        .filter(t -> t.getType() == TransactionType.TRANSFER_OUT)
                        .count()
        );

        assertEquals(
                1,
                transactions.stream()
                        .filter(t -> t.getType() == TransactionType.TRANSFER_IN)
                        .count()
        );
    }

    private String generateAccountNumber() {
        // 12 chữ số; kiểm tra trùng trước khi sử dụng
        for (int i = 0; i < 20; i++) {
            String number = "8" + String.format(
                    "%011d",
                    java.util.concurrent.ThreadLocalRandom.current()
                            .nextLong(100_000_000_000L)
            );

            if (!bankAccountRepository.existsByAccountNumber(number)) {
                return number;
            }
        }

        throw new IllegalStateException(
                "Could not generate a unique account number"
        );
    }
}
