package com.billFlow.billFlow.dto;


import lombok.Data;

@Data
public class ProductRequest {

    private String name;

    private String description;

    private Double price;

    private Double taxRate;
}
