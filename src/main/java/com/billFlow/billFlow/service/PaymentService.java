package com.billFlow.billFlow.service;

import com.billFlow.billFlow.dto.PaymentRequest;
import com.billFlow.billFlow.entity.Invoice;
import com.billFlow.billFlow.entity.Payment;
import com.billFlow.billFlow.repository.InvoiceRepository;
import com.billFlow.billFlow.repository.PaymentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public Payment recordPayment(PaymentRequest request) {

        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment payment = Payment.builder()
                .amount(request.getAmount())
                .paymentDate(LocalDate.now())
                .paymentMethod(request.getPaymentMethod())
                .invoice(invoice)
                .tenant(invoice.getTenant())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        updateInvoiceStatus(invoice);

        return savedPayment;
    }

    private void updateInvoiceStatus(Invoice invoice) {

        Double totalPaid =
                paymentRepository.getTotalPaidAmount(invoice.getId());

        Double invoiceAmount = invoice.getTotalAmount();

        if (totalPaid >= invoiceAmount) {
            invoice.setStatus("PAID");
        } else if (totalPaid > 0) {
            invoice.setStatus("PARTIAL");
        } else {
            invoice.setStatus("UNPAID");
        }

        invoiceRepository.save(invoice);
    }
    public List<Payment> getPayments() {
    return paymentRepository.findAll();
}
}