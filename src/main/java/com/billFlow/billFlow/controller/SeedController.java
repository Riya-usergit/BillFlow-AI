package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.entity.*;
import com.billFlow.billFlow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SeedController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/seed")
    public String seed() {
        User user = userRepository.findByEmail("riyamprajapati@gmail.com").orElse(null);
        Tenant tenant;

        if (user == null) {
            tenant = Tenant.builder()
                    .companyName("Prajapati Enterprises")
                    .build();
            tenantRepository.save(tenant);

            user = User.builder()
                    .name("Riya Prajapati")
                    .email("riyamprajapati@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.OWNER)
                    .tenant(tenant)
                    .build();
            userRepository.save(user);
        } else {
            tenant = user.getTenant();
        }

        // Clean existing data for this tenant
        paymentRepository.findByTenantId(tenant.getId()).forEach(paymentRepository::delete);
        invoiceItemRepository.findAll().forEach(item -> {
            if (item.getInvoice() != null && tenant.getId().equals(item.getInvoice().getTenant().getId())) {
                invoiceItemRepository.delete(item);
            }
        });
        invoiceRepository.findByTenantId(tenant.getId()).forEach(invoiceRepository::delete);
        productRepository.findByTenant_Id(tenant.getId()).forEach(productRepository::delete);
        clientRepository.findByTenant_Id(tenant.getId()).forEach(clientRepository::delete);

        // 1. Create Clients
        Client client1 = Client.builder()
                .name("Alice Smith")
                .email("alice@acme.com")
                .phone("9876543210")
                .companyName("Acme Corporation")
                .gstNumber("27AAAAA1111A1Z1")
                .address("123 Business Park, Mumbai")
                .tenant(tenant)
                .build();
        clientRepository.save(client1);

        Client client2 = Client.builder()
                .name("Rahul Sharma")
                .email("rahul@swiggy.com")
                .phone("9876543211")
                .companyName("Swiggy Delivery Services")
                .gstNumber("27BBBBB2222B2Z2")
                .address("456 Outer Ring Road, Bangalore")
                .tenant(tenant)
                .build();
        clientRepository.save(client2);

        Client client3 = Client.builder()
                .name("John Doe")
                .email("john@zomato.com")
                .phone("9876543212")
                .companyName("Zomato Logistics")
                .gstNumber("27CCCCC3333C3Z3")
                .address("789 Food Street, Delhi")
                .tenant(tenant)
                .build();
        clientRepository.save(client3);

        // 2. Create Products
        Product prod1 = Product.builder()
                .name("Cloud Consulting Services")
                .description("Hourly rate for senior enterprise cloud architecture consulting")
                .price(15000.0)
                .taxRate(18.0)
                .tenant(tenant)
                .build();
        productRepository.save(prod1);

        Product prod2 = Product.builder()
                .name("API Integration Package")
                .description("One-time payment gateway integration setup and custom webhooks")
                .price(25000.0)
                .taxRate(18.0)
                .tenant(tenant)
                .build();
        productRepository.save(prod2);

        Product prod3 = Product.builder()
                .name("SaaS Monthly Premium Subscription")
                .description("Premium subscription tier monthly recurring fee")
                .price(5000.0)
                .taxRate(18.0)
                .tenant(tenant)
                .build();
        productRepository.save(prod3);

        // 3. Create Invoices and items
        // Invoice 1: PAID (25,000)
        Invoice inv1 = Invoice.builder()
                .invoiceNumber("INV-2026-1001")
                .client(client1)
                .issueDate(LocalDate.now().minusDays(30))
                .dueDate(LocalDate.now().minusDays(15))
                .status("PAID")
                .totalAmount(25000.0)
                .tenant(tenant)
                .build();
        invoiceRepository.save(inv1);

        InvoiceItem item1 = InvoiceItem.builder()
                .invoice(inv1)
                .product(prod2)
                .quantity(1)
                .unitPrice(25000.0)
                .amount(25000.0)
                .build();
        invoiceItemRepository.save(item1);

        Payment pay1 = Payment.builder()
                .amount(25000.0)
                .paymentDate(LocalDate.now().minusDays(15))
                .paymentMethod("UPI")
                .invoice(inv1)
                .tenant(tenant)
                .build();
        paymentRepository.save(pay1);

        // Invoice 2: UNPAID (15,000)
        Invoice inv2 = Invoice.builder()
                .invoiceNumber("INV-2026-1002")
                .client(client2)
                .issueDate(LocalDate.now().minusDays(5))
                .dueDate(LocalDate.now().plusDays(10))
                .status("UNPAID")
                .totalAmount(15000.0)
                .tenant(tenant)
                .build();
        invoiceRepository.save(inv2);

        InvoiceItem item2 = InvoiceItem.builder()
                .invoice(inv2)
                .product(prod1)
                .quantity(1)
                .unitPrice(15000.0)
                .amount(15000.0)
                .build();
        invoiceItemRepository.save(item2);

        // Invoice 3: OVERDUE (35,000)
        Invoice inv3 = Invoice.builder()
                .invoiceNumber("INV-2026-1003")
                .client(client3)
                .issueDate(LocalDate.now().minusDays(20))
                .dueDate(LocalDate.now().minusDays(5))
                .status("OVERDUE")
                .totalAmount(35000.0)
                .tenant(tenant)
                .build();
        invoiceRepository.save(inv3);

        InvoiceItem item3 = InvoiceItem.builder()
                .invoice(inv3)
                .product(prod1)
                .quantity(2)
                .unitPrice(15000.0)
                .amount(30000.0)
                .build();
        invoiceItemRepository.save(item3);

        InvoiceItem item4 = InvoiceItem.builder()
                .invoice(inv3)
                .product(prod3)
                .quantity(1)
                .unitPrice(5000.0)
                .amount(5000.0)
                .build();
        invoiceItemRepository.save(item4);

        // Invoice 4: PARTIAL (30,000 total, 10,000 paid)
        Invoice inv4 = Invoice.builder()
                .invoiceNumber("INV-2026-1004")
                .client(client1)
                .issueDate(LocalDate.now().minusDays(10))
                .dueDate(LocalDate.now().plusDays(5))
                .status("PARTIAL")
                .totalAmount(30000.0)
                .tenant(tenant)
                .build();
        invoiceRepository.save(inv4);

        InvoiceItem item5 = InvoiceItem.builder()
                .invoice(inv4)
                .product(prod1)
                .quantity(2)
                .unitPrice(15000.0)
                .amount(30000.0)
                .build();
        invoiceItemRepository.save(item5);

        Payment pay2 = Payment.builder()
                .amount(10000.0)
                .paymentDate(LocalDate.now().minusDays(2))
                .paymentMethod("CARD")
                .invoice(inv4)
                .tenant(tenant)
                .build();
        paymentRepository.save(pay2);

        return "Database seeded successfully!";
    }
}
