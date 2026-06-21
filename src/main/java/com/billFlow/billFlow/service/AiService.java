package com.billFlow.billFlow.service;
import org.springframework.web.client.RestTemplate;
import com.billFlow.billFlow.dto.PaymentPredictionRequest;
import com.billFlow.billFlow.dto.PaymentPredictionResponse;
import com.billFlow.billFlow.dto.ReminderResponse;
import com.billFlow.billFlow.dto.ClientHealthResponse;
import com.billFlow.billFlow.dto.InvoiceRiskResponse;
import com.billFlow.billFlow.entity.Client;
import com.billFlow.billFlow.repository.ClientRepository;
import com.billFlow.billFlow.repository.InvoiceRepository;
import com.billFlow.billFlow.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.billFlow.billFlow.dto.PaymentPredictionData;
import com.billFlow.billFlow.entity.Invoice;
import com.billFlow.billFlow.entity.Payment;
import com.billFlow.billFlow.repository.PaymentRepository;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class AiService {
   private final RestTemplate restTemplate;
    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    public ClientHealthResponse getClientHealth(Long clientId) {

         System.out.println("AI SERVICE CALLED");

    Client client =
            clientRepository.findById(clientId)
                    .orElseThrow();

    System.out.println("CLIENT FOUND: " + client.getName());

        Double revenue =
                invoiceRepository.getTotalRevenueByClient(clientId);

        Double outstanding =
                invoiceRepository.getOutstandingAmount(clientId);

        int score = 100;

        // Outstanding penalty
        if (outstanding > 50000)
            score -= 30;
        else if (outstanding > 10000)
            score -= 15;
        else if (outstanding > 0)
            score -= 5;

        // Revenue bonus
        if (revenue > 500000)
            score += 20;
        else if (revenue > 100000)
            score += 10;

        if (score > 100)
            score = 100;

        String risk;

        if (score >= 80)
            risk = "LOW";
        else if (score >= 60)
            risk = "MEDIUM";
        else
            risk = "HIGH";

        return ClientHealthResponse.builder()
                .clientId(client.getId())
                .clientName(client.getName())
                .healthScore(score)
                .riskLevel(risk)
                .totalRevenue(revenue)
                .outstandingAmount(outstanding)
                .averageDelayDays(0)
                .build();
    }
    public List<PaymentPredictionData> exportTrainingData() {

    List<Payment> payments =
            paymentRepository.findAll();

    List<PaymentPredictionData> dataset =
            new ArrayList<>();

    for (Payment payment : payments) {

        Invoice invoice = payment.getInvoice();

        long daysToPay =
                ChronoUnit.DAYS.between(
                        invoice.getIssueDate(),
                        payment.getPaymentDate()
                );

        int paidLate =
                payment.getPaymentDate()
                        .isAfter(invoice.getDueDate())
                        ? 1 : 0;

        dataset.add(
                PaymentPredictionData.builder()
                        .invoiceAmount(invoice.getTotalAmount())
                        .daysToPay((int) daysToPay)
                        .paidLate(paidLate)
                        .build()
        );
    }

    return dataset;
}  
public PaymentPredictionResponse predictLatePayment(
        Double invoiceAmount,
        Integer daysToPay) {

    PaymentPredictionRequest request =
            new PaymentPredictionRequest(
                    invoiceAmount,
                    daysToPay
            );

    return restTemplate.postForObject(
            "http://localhost:8000/predict",
            request,
            PaymentPredictionResponse.class
    );
}
public InvoiceRiskResponse predictInvoiceRisk(Long invoiceId) {

    Invoice invoice = invoiceRepository
            .findById(invoiceId)
            .orElseThrow();

    long daysToPay =
            java.time.temporal.ChronoUnit.DAYS.between(
                    invoice.getIssueDate(),
                    invoice.getDueDate()
            );

    PaymentPredictionResponse prediction =
            predictLatePayment(
                    invoice.getTotalAmount(),
                    (int) daysToPay
            );

    String riskLevel;
    String action;

    double probability =
            prediction.getLatePaymentProbability();

    if (probability >= 0.80) {

        riskLevel = "HIGH";
        action = "Send Reminder Email";

    } else if (probability >= 0.50) {

        riskLevel = "MEDIUM";
        action = "Monitor Payment";

    } else {

        riskLevel = "LOW";
        action = "No Action Needed";
    }

    if ("PAID".equalsIgnoreCase(invoice.getStatus())) {

    return InvoiceRiskResponse.builder()
            .invoiceId(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .riskLevel("NONE")
            .latePaymentProbability(0.0)
            .recommendedAction("Invoice Already Paid")
            .build();
}

    return InvoiceRiskResponse.builder()
            .invoiceId(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .riskLevel(riskLevel)
            .latePaymentProbability(probability)
            .recommendedAction(action)
            .build();
}
public ReminderResponse sendReminder(Long invoiceId) {

    Invoice invoice = invoiceRepository
            .findById(invoiceId)
            .orElseThrow();

    if ("PAID".equalsIgnoreCase(invoice.getStatus())) {

        return ReminderResponse.builder()
                .invoiceNumber(invoice.getInvoiceNumber())
                .clientEmail(invoice.getClient().getEmail())
                .riskLevel("NONE")
                .message("Invoice already paid")
                .build();
    }

    InvoiceRiskResponse risk =
            predictInvoiceRisk(invoiceId);

    String emailBody =
            "Dear " + invoice.getClient().getName() + ",\n\n" +
            "This is a reminder regarding Invoice " +
            invoice.getInvoiceNumber() + ".\n\n" +
            "Amount: ₹" + invoice.getTotalAmount() + "\n" +
            "Due Date: " + invoice.getDueDate() + "\n\n" +
            "Please complete the payment before the due date.\n\n" +
            "Regards,\nBillFlow AI";

    emailService.sendEmail(
            invoice.getClient().getEmail(),
            "Payment Reminder - " + invoice.getInvoiceNumber(),
            emailBody
    );

    return ReminderResponse.builder()
            .invoiceNumber(invoice.getInvoiceNumber())
            .clientEmail(invoice.getClient().getEmail())
            .riskLevel(risk.getRiskLevel())
            .message("Reminder email sent successfully")
            .build();
}
}