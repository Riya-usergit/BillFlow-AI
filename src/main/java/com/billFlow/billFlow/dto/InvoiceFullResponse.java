package com.billFlow.billFlow.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InvoiceFullResponse {

    private Long id;
    private String invoiceNumber;
    private String clientName;
    private Double totalAmount;
    private String status;

    private List<InvoiceItemResponse> items;
}