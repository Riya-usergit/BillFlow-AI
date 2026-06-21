package com.billFlow.billFlow.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    private Long invoiceId;

    private Double amount;

    private String paymentMethod;
}