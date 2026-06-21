package com.billFlow.billFlow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceResponse {

    private Long id;

    private String invoiceNumber;

    private Double totalAmount;

    private String status;
}