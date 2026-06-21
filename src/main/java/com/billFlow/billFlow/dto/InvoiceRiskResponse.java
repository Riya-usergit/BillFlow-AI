package com.billFlow.billFlow.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRiskResponse {

    private Long invoiceId;
    private String invoiceNumber;
    private String riskLevel;
    private Double latePaymentProbability;
    private String recommendedAction;
}