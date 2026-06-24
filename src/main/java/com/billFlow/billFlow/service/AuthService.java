package com.billFlow.billFlow.service;

import com.billFlow.billFlow.dto.LoginRequest;
import com.billFlow.billFlow.dto.RegisterRequest;
import com.billFlow.billFlow.repository.UserRepository;
import com.billFlow.billFlow.security.JwtService;
import com.billFlow.billFlow.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import com.billFlow.billFlow.entity.*;
import com.billFlow.billFlow.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;    
    private final PasswordEncoder passwordEncoder;

    public String register(RegisterRequest request) {

    if(userRepository.existsByEmail(
            request.getEmail())) {

        return "Email already exists";
    }

    Tenant tenant = Tenant.builder()
            .companyName(request.getCompanyName())
            .build();

    tenantRepository.save(tenant);

    User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            )
            .role(request.getRole() != null ? request.getRole() : Role.OWNER)
            .tenant(tenant)
            .build();

    userRepository.save(user);

    return "User Registered Successfully";
}
    
    public AuthResponse login(LoginRequest request) {

    User user = userRepository
            .findByEmail(request.getEmail())
            .orElse(null);

    if(user == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    if(!passwordEncoder.matches(
            request.getPassword(),
            user.getPassword())) {

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    String token =
            jwtService.generateToken(
                    user.getEmail()
            );

    return new AuthResponse(token);
}
}