package com.billFlow.billFlow.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String companyName;

    private String gstNumber;

    private String address;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
}