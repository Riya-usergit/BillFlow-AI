package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.dto.PaymentRequest;
import com.billFlow.billFlow.entity.Payment;
import com.billFlow.billFlow.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestBody PaymentRequest request) {

        Payment payment = paymentService.recordPayment(request);

        return ResponseEntity.ok(payment);
    }
}