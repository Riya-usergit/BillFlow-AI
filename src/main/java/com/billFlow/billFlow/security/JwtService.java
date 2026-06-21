package com.billFlow.billFlow.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(String email) {

        SecretKey key =
                Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000L * 60 * 60 * 24
                        )
                )
                .signWith(key)
                .compact();
    }
    public String extractUsername(String token) {

    SecretKey key =
            Keys.hmacShaKeyFor(secret.getBytes());

    return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
}   
public boolean isTokenValid(String token) {

    try {

        SecretKey key =
                Keys.hmacShaKeyFor(secret.getBytes());

        Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

        return true;

    } catch (Exception e) {

        return false;
    }
}
}