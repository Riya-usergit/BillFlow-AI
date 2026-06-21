package com.billFlow.billFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ClientHealthResponse {

    private Long clientId;
    private String clientName;

    private Integer healthScore;

    private String riskLevel;

    private Double totalRevenue;

    private Double outstandingAmount;

    private Integer averageDelayDays;
}