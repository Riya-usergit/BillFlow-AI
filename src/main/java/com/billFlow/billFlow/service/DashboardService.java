package com.billFlow.billFlow.service;

import com.billFlow.billFlow.entity.Invoice;
import com.billFlow.billFlow.entity.User;
import com.billFlow.billFlow.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import com.billFlow.billFlow.repository.ClientRepository;
import com.billFlow.billFlow.repository.InvoiceRepository;
import com.billFlow.billFlow.repository.PaymentRepository;
import com.billFlow.billFlow.dto.DashboardResponse;

@RequiredArgsConstructor
@Service
public class DashboardService {

    private final CurrentUserService currentUserService;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;
    public DashboardResponse getDashboard() {

    Long tenantId =
            currentUserService.getCurrentTenantId();


updateOverdueInvoices(tenantId);
    return DashboardResponse.builder()

            .totalRevenue(
                    paymentRepository
                            .getTotalRevenueByTenant(tenantId)
            )

            .outstandingAmount(
                    invoiceRepository
                            .getOutstandingAmountByTenant(tenantId)
            )

            .totalInvoices(
                    invoiceRepository
                            .countByTenantId(tenantId)
            )

            .totalPayments(
                    paymentRepository
                            .countByTenantId(tenantId)
            )

            .paidInvoices(
                    invoiceRepository
                            .countByTenantIdAndStatus(
                                    tenantId,
                                    "PAID"
                            )
            )

            .unpaidInvoices(
                    invoiceRepository
                            .countByTenantIdAndStatus(
                                    tenantId,
                                    "UNPAID"
                            )
            )

            .partialInvoices(
                    invoiceRepository
                            .countByTenantIdAndStatus(
                                    tenantId,
                                    "PARTIAL"
                            )
            )
            .overdueInvoices(invoiceRepository.countByTenantIdAndStatus(
        tenantId,
        "OVERDUE"
))

            .totalClients(
                    clientRepository
                            .countByTenantId(tenantId)
            )

            .build();
}
private void updateOverdueInvoices(Long tenantId) {

    List<Invoice> invoices =
            invoiceRepository.findByTenantId(tenantId);

    for (Invoice invoice : invoices) {

        if (!"PAID".equals(invoice.getStatus())
                && invoice.getDueDate().isBefore(LocalDate.now())) {

            invoice.setStatus("OVERDUE");

            invoiceRepository.save(invoice);
        }
    }
}}