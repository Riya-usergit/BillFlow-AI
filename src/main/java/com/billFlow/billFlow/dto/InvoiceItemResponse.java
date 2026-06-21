package com.billFlow.billFlow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceItemResponse {

    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double amount;
}