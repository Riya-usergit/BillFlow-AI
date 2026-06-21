package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.dto.DashboardResponse;
import com.billFlow.billFlow.dto.InvoiceFullResponse;
import com.billFlow.billFlow.dto.InvoiceRequest;
import com.billFlow.billFlow.dto.InvoiceResponse;
import com.billFlow.billFlow.service.InvoiceService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public InvoiceResponse createInvoice(
            @RequestBody InvoiceRequest request,
            Authentication authentication) {

        return invoiceService.createInvoice(
                request,
                authentication.getName()
        );
    }@GetMapping("/{id}")
public InvoiceFullResponse getInvoice(
        @PathVariable Long id,
        Authentication authentication) {

    return invoiceService.getInvoice(id, authentication.getName());
}
@PostMapping("/{id}/send-email")
public String sendInvoiceEmail(
        @PathVariable Long id) {

    invoiceService.sendInvoice(id);

    return "Invoice emailed successfully";
}

}