
package com.brian.digitalbanking.controller;

import com.brian.digitalbanking.dto.AccountResponse;
import com.brian.digitalbanking.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/me")
    public List<AccountResponse> getMyAccounts(
            Authentication authentication) {
        return accountService.getMyAccounts(authentication);
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            Authentication authentication) {
        AccountResponse account =
                accountService.createAccount(authentication);

        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }
}
