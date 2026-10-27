
package com.brian.digitalbanking.service;

import com.brian.digitalbanking.dto.DepositRequest;
import com.brian.digitalbanking.entity.AccountStatus;
import com.brian.digitalbanking.entity.BankAccount;
import com.brian.digitalbanking.entity.Transaction;
import com.brian.digitalbanking.entity.TransactionType;
import com.brian.digitalbanking.entity.User;
import com.brian.digitalbanking.repository.BankAccountRepository;
import com.brian.digitalbanking.repository.TransactionRepository;
import com.brian.digitalbanking.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.brian.digitalbanking.dto.TransactionResponse;
import com.brian.digitalbanking.dto.TransferRequest;
import com.brian.digitalbanking.dto.TransferResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;


@Service
public class TransactionService {

    private final BankAccountRepository bankAccountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(
            BankAccountRepository bankAccountRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository) {
        this.bankAccountRepository = bankAccountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse deposit(
            Authentication authentication,
            DepositRequest request) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        BankAccount account = bankAccountRepository
                .findByAccountNumberAndUserIdForUpdate(
                        request.accountNumber(), user.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Account not found"
                ));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Account is not active");
        }

        if (request.amount() == null
                || request.amount().compareTo(BigDecimal.ZERO) <= 0
                || request.amount().scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Amount must be positive with at most 2 decimal places");
        }

        BigDecimal newBalance =
                account.getBalance().add(request.amount());

        account.setBalance(newBalance);
        bankAccountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setAmount(request.amount());
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription("Demo deposit");

        Transaction saved = transactionRepository.save(transaction);

        return new TransactionResponse(
                saved.getId(),
                account.getAccountNumber(),
                saved.getType(),
                saved.getAmount(),
                saved.getBalanceAfter(),
                saved.getDescription(),
                saved.getCreatedAt()
        );
    }


    @Transactional
    public TransactionResponse withdraw(
            Authentication authentication,
            DepositRequest request
    ) {
        // 1. Tìm người dùng đang đăng nhập
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        // 2. Tìm và khóa tài khoản thuộc người dùng
        BankAccount account = bankAccountRepository
                .findByAccountNumberAndUserIdForUpdate(
                        request.accountNumber(), user.getId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Bank account not found"
                ));

        // 3. Kiểm tra tài khoản có hoạt động không
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Account is not active"
            );
        }

        // 4. Kiểm tra số tiền
        BigDecimal amount = request.amount();

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0
                || amount.scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid withdrawal amount"
            );
        }

        // 5. Không cho phép số dư âm
        if (account.getBalance().compareTo(amount) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Insufficient balance"
            );
        }

        // 6. Trừ tiền trong tài khoản
        BigDecimal newBalance = account.getBalance().subtract(amount);
        account.setBalance(newBalance);
        bankAccountRepository.save(account);

        // 7. Ghi lịch sử giao dịch
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(TransactionType.WITHDRAWAL);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setDescription("Demo withdrawal");

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 8. Trả dữ liệu về client
        return new TransactionResponse(
                savedTransaction.getId(),
                account.getAccountNumber(),
                savedTransaction.getType(),
                savedTransaction.getAmount(),
                savedTransaction.getBalanceAfter(),
                savedTransaction.getDescription(),
                savedTransaction.getCreatedAt()
        );
    }


    @Transactional
    public TransferResponse transfer(
            Authentication authentication,
            TransferRequest request
    ) {
        // 1. Tìm người dùng đang đăng nhập
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        String sourceNumber = request.sourceAccountNumber();
        String destinationNumber = request.destinationAccountNumber();
        BigDecimal amount = request.amount();

        // 2. Kiểm tra dữ liệu nghiệp vụ
        if (sourceNumber.equals(destinationNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Source and destination accounts must be different"
            );
        }

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0
                || amount.scale() > 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid transfer amount"
            );
        }

        // 3. Khóa cả hai tài khoản theo thứ tự nhất quán
        List<BankAccount> accounts =
                bankAccountRepository
                        .findAllByAccountNumberInOrderByAccountNumberAsc(
                                List.of(sourceNumber, destinationNumber)
                        );

        Map<String, BankAccount> accountMap = accounts.stream()
                .collect(java.util.stream.Collectors.toMap(
                        BankAccount::getAccountNumber,
                        account -> account
                ));

        BankAccount source = accountMap.get(sourceNumber);
        BankAccount destination = accountMap.get(destinationNumber);

        if (source == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Source account not found"
            );
        }

        if (!source.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Source account not found"
            );
        }

        if (destination == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Destination account not found"
            );
        }

        // 4. Kiểm tra trạng thái tài khoản
        if (source.getStatus() != AccountStatus.ACTIVE
                || destination.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Both accounts must be active"
            );
        }

        // 5. Kiểm tra số dư
        if (source.getBalance().compareTo(amount) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Insufficient balance"
            );
        }

        // 6. Cập nhật hai số dư
        BigDecimal sourceBalanceAfter =
                source.getBalance().subtract(amount);

        BigDecimal destinationBalanceAfter =
                destination.getBalance().add(amount);

        source.setBalance(sourceBalanceAfter);
        destination.setBalance(destinationBalanceAfter);

        bankAccountRepository.save(source);
        bankAccountRepository.save(destination);

        // 7. Ghi hai giao dịch tương ứng
        Transaction debit = new Transaction();
        debit.setAccount(source);
        debit.setType(TransactionType.TRANSFER_OUT);
        debit.setAmount(amount);
        debit.setBalanceAfter(sourceBalanceAfter);
        debit.setDescription("Transfer to " + destinationNumber);

        Transaction credit = new Transaction();
        credit.setAccount(destination);
        credit.setType(TransactionType.TRANSFER_IN);
        credit.setAmount(amount);
        credit.setBalanceAfter(destinationBalanceAfter);
        credit.setDescription("Transfer from " + sourceNumber);

        transactionRepository.save(debit);
        transactionRepository.save(credit);

        // 8. Trả kết quả
        return new TransferResponse(
                UUID.randomUUID().toString(),
                sourceNumber,
                destinationNumber,
                amount,
                sourceBalanceAfter,
                destinationBalanceAfter,
                LocalDateTime.now()
        );
    }


    @Transactional(readOnly = true)
    public Page<TransactionResponse> getMyTransactions(
            Authentication authentication,
            Pageable pageable,
            TransactionType type,
            LocalDate from,
            LocalDate to
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "'from' must not be after 'to'"
            );
        }

        LocalDateTime fromDate = from == null
                ? null : from.atStartOfDay();

        LocalDateTime toDateExclusive = to == null
                ? null : to.plusDays(1).atStartOfDay();

        Page<Transaction> transactions =
                transactionRepository.searchTransactions(
                        user.getId(),
                        type,
                        fromDate,
                        toDateExclusive,
                        pageable
                );

        return transactions.map(transaction ->
                new TransactionResponse(
                        transaction.getId(),
                        transaction.getAccount().getAccountNumber(),
                        transaction.getType(),
                        transaction.getAmount(),
                        transaction.getBalanceAfter(),
                        transaction.getDescription(),
                        transaction.getCreatedAt()
                )
        );
    }

    public TransactionResponse getTransactionById(
            Authentication authentication,
            Long transactionId
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        Transaction transaction = transactionRepository
                .findByIdAndAccount_User_Id(transactionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found"
                ));

        return new TransactionResponse(
                transaction.getId(),
                transaction.getAccount().getAccountNumber(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }



}
