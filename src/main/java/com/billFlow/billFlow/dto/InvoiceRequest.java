package com.billFlow.billFlow.dto;

import lombok.Data;

import java.util.List;

@Data
public class InvoiceRequest {

    private Long clientId;

    private String invoiceNumber;

    private String issueDate;

    private String dueDate;

    private List<InvoiceItemRequest> items;
}