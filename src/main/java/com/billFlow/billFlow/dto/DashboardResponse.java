package com.billFlow.billFlow.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponse {

    private Double totalRevenue;
    private Long overdueInvoices;
    private Double outstandingAmount;

    private Long totalInvoices;

    private Long totalPayments;

    private Long paidInvoices;

    private Long unpaidInvoices;

    private Long partialInvoices;

    private Long totalClients;
}