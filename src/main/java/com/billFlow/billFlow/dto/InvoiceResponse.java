package com.billFlow.billFlow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceResponse {

    private Long id;

    private String invoiceNumber;

    private String clientName;

    private String issueDate;

    private String dueDate;

    private Double totalAmount;

    private String status;
}