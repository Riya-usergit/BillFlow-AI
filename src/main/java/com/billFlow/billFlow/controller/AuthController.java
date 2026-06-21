package com.billFlow.billFlow.controller;
import com.billFlow.billFlow.dto.AuthResponse;
import com.billFlow.billFlow.dto.LoginRequest;
import com.billFlow.billFlow.dto.RegisterRequest;
import com.billFlow.billFlow.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request) {

        return authService.register(request);
    }
 @PostMapping("/login")
public AuthResponse login(
        @RequestBody LoginRequest request) {

    return authService.login(request);
}       

}