package com.billFlow.billFlow.dto;

import lombok.Data;

@Data
public class ClientRequest {

    private String name;
    private String email;
    private String phone;
    private String companyName;
    private String gstNumber;
    private String address;
}