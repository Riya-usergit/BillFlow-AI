package com.billFlow.billFlow.controller;
import com.billFlow.billFlow.dto.InvoiceRiskResponse;
import com.billFlow.billFlow.dto.ClientHealthResponse;
import com.billFlow.billFlow.dto.PaymentPredictionData;
import com.billFlow.billFlow.service.AiService;
import com.billFlow.billFlow.dto.PaymentPredictionRequest;
import com.billFlow.billFlow.dto.PaymentPredictionResponse;
import com.billFlow.billFlow.dto.ReminderResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.billFlow.billFlow.dto.PaymentPredictionData;
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    
    @GetMapping("/client-health/{clientId}")
    public ClientHealthResponse getClientHealth(
            @PathVariable Long clientId) {

        return aiService.getClientHealth(clientId);
    }
    @GetMapping("/export-training-data")
public List<PaymentPredictionData> exportTrainingData() {

    return aiService.exportTrainingData();
}
@PostMapping("/predict")
public PaymentPredictionResponse predict(
        @RequestBody PaymentPredictionRequest request) {

    return aiService.predictLatePayment(
            request.getInvoiceAmount(),
            request.getDaysToPay()
    );
}
@PostMapping("/send-reminder/{invoiceId}")
public ReminderResponse sendReminder(
        @PathVariable Long invoiceId) {

    return aiService.sendReminder(invoiceId);
}


@GetMapping("/predict-invoice/{invoiceId}")
public InvoiceRiskResponse predictInvoiceRisk(
        @PathVariable Long invoiceId) {

    return aiService.predictInvoiceRisk(invoiceId);
}
}