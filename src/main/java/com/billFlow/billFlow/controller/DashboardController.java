package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.dto.InvoiceFullResponse;
import com.billFlow.billFlow.dto.InvoiceRequest;
import com.billFlow.billFlow.dto.InvoiceResponse;
import com.billFlow.billFlow.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.billFlow.billFlow.service.DashboardService;
import com.billFlow.billFlow.dto.DashboardResponse;
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}