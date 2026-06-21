package com.billFlow.billFlow.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPredictionData {

    private Double invoiceAmount;

    private Integer daysToPay;

    private Integer paidLate;
}