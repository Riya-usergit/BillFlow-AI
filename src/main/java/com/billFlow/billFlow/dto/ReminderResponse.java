package com.billFlow.billFlow.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {

    private String invoiceNumber;
    private String clientEmail;
    private String riskLevel;
    private String message;
}