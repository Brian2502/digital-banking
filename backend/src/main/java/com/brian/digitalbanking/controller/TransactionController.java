
package com.brian.digitalbanking.controller;

import com.brian.digitalbanking.dto.DepositRequest;
import com.brian.digitalbanking.dto.TransactionResponse;
import com.brian.digitalbanking.service.TransactionService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.brian.digitalbanking.dto.TransferRequest;
import com.brian.digitalbanking.dto.TransferResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import com.brian.digitalbanking.entity.TransactionType;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(
            Authentication authentication,
            @Valid @RequestBody DepositRequest request) {
        return transactionService.deposit(authentication, request);
    }


    @PostMapping("/withdraw")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse withdraw(
            Authentication authentication,
            @Valid @RequestBody DepositRequest request
    ) {
        return transactionService.withdraw(authentication, request);
    }


    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse transfer(
            Authentication authentication,
            @Valid @RequestBody TransferRequest request
    ) {
        return transactionService.transfer(authentication, request);
    }


    @GetMapping("/me")
    public Page<TransactionResponse> getMyTransactions(
            Authentication authentication,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return transactionService.getMyTransactions(
                authentication, pageable, type, from, to
        );
    }

    @GetMapping("/{transactionId}")
    public TransactionResponse getTransactionById(
            Authentication authentication,
            @PathVariable Long transactionId
    ) {
        return transactionService.getTransactionById(
                authentication,
                transactionId
        );
    }
}
