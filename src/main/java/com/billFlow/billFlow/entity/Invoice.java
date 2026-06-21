package com.billFlow.billFlow.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;


@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;

    @ManyToOne
    private Client client;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private String status; // DRAFT, PAID, UNPAID

    private Double totalAmount;

    @ManyToOne
    private Tenant tenant;
}