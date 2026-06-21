package com.billFlow.billFlow.entity;


import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private Double price;

    private Double taxRate;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    @JsonIgnore
    private Tenant tenant;
}