
package com.brian.digitalbanking.controller;

import com.brian.digitalbanking.dto.RegisterRequest;
import com.brian.digitalbanking.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.brian.digitalbanking.dto.LoginRequest;
import com.brian.digitalbanking.dto.LoginResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);

        return Map.of(
                "message",
                "Account registered successfully"
        );
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }


}
