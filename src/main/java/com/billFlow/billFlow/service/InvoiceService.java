package com.billFlow.billFlow.service;

import com.billFlow.billFlow.dto.InvoiceFullResponse;
import com.billFlow.billFlow.dto.InvoiceItemRequest;
import com.billFlow.billFlow.dto.InvoiceItemResponse;
import com.billFlow.billFlow.dto.InvoiceRequest;
import com.billFlow.billFlow.dto.InvoiceResponse;
import com.billFlow.billFlow.entity.*;
import com.billFlow.billFlow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.billFlow.billFlow.service.CurrentUserService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final PdfService pdfService;
private final EmailService emailService;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    public InvoiceResponse createInvoice(
            InvoiceRequest request,
            String email) {

        // 1. Get User + Tenant
        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Tenant tenant = user.getTenant();

        // 2. Validate Client
        Client client = clientRepository
                .findByIdAndTenant_Id(request.getClientId(), tenant.getId())
                .orElseThrow();

        // 3. Create Invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
                .client(client)
                .issueDate(LocalDate.parse(request.getIssueDate()))
                .dueDate(LocalDate.parse(request.getDueDate()))
                .status("DRAFT")
                .totalAmount(0.0)
                .tenant(tenant)
                .build();

        invoice = invoiceRepository.save(invoice);

        // 4. Calculate Total
        double total = 0.0;

        for (InvoiceItemRequest itemReq : request.getItems()) {

            Product product = productRepository
                    .findByIdAndTenant_Id(itemReq.getProductId(), tenant.getId())
                    .orElseThrow();

            double amount = product.getPrice() * itemReq.getQuantity();

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .amount(amount)
                    .build();

            invoiceItemRepository.save(item);

            total += amount;
        }

        // 5. Update total
        invoice.setTotalAmount(total);
        invoiceRepository.save(invoice);

        // 6. Return response
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .clientName(invoice.getClient() != null ? invoice.getClient().getName() : "")
                .issueDate(invoice.getIssueDate() != null ? invoice.getIssueDate().toString() : "")
                .dueDate(invoice.getDueDate() != null ? invoice.getDueDate().toString() : "")
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .build();
    }
    public InvoiceFullResponse getInvoice(Long invoiceId, String email) {

    User user = userRepository.findByEmail(email).orElseThrow();
    Tenant tenant = user.getTenant();

    Invoice invoice = invoiceRepository
            .findByIdAndTenant_Id(invoiceId, currentUserService.getCurrentTenantId())
            .orElseThrow();
List<InvoiceItem> items = invoiceItemRepository
        .findByInvoiceId(invoiceId);

List<InvoiceItemResponse> itemResponses = items.stream()
        .map(i -> InvoiceItemResponse.builder()
                .productName(i.getProduct().getName())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .amount(i.getAmount())
                .build())
        .toList();

    return InvoiceFullResponse.builder()
            .id(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .clientName(invoice.getClient().getName())
            .totalAmount(invoice.getTotalAmount())
            .status(invoice.getStatus())
            .items(itemResponses)
            .build();
}
public void sendInvoice(Long invoiceId) {

    Invoice invoice = invoiceRepository
            .findById(invoiceId)
            .orElseThrow();

    byte[] pdf =
            pdfService.generateInvoicePdf(invoiceId);

    emailService.sendInvoiceEmail(
            invoice.getClient().getEmail(),
            invoice.getInvoiceNumber(),
            pdf
    );
}

@Transactional
public int updateOverdueInvoices(Long tenantId) {
    return invoiceRepository.markOverdueInvoices(tenantId, LocalDate.now());
}public List<InvoiceResponse> getInvoices(
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    return invoiceRepository
            .findByTenant(user.getTenant())
            .stream()
            .map(invoice -> InvoiceResponse.builder()
                    .id(invoice.getId())
                    .invoiceNumber(invoice.getInvoiceNumber())
                    .clientName(invoice.getClient() != null ? invoice.getClient().getName() : "")
                    .issueDate(invoice.getIssueDate() != null ? invoice.getIssueDate().toString() : "")
                    .dueDate(invoice.getDueDate() != null ? invoice.getDueDate().toString() : "")
                    .totalAmount(invoice.getTotalAmount())
                    .status(invoice.getStatus())
                    .build())
            .collect(Collectors.toList());
}
}