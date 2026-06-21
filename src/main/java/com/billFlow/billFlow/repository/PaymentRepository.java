package com.billFlow.billFlow.repository;

import com.billFlow.billFlow.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceId(Long invoiceId);

    List<Payment> findByTenantId(Long tenantId);
    
    @Query("""
           SELECT COALESCE(SUM(p.amount), 0)
           FROM Payment p
           WHERE p.invoice.id = :invoiceId
           """)
    Double getTotalPaidAmount(@Param("invoiceId") Long invoiceId);
    @Query("SELECT COALESCE(SUM(p.amount),0) FROM Payment p")
Double getTotalRevenue();
    @Query("""
SELECT COALESCE(SUM(p.amount),0)
FROM Payment p
WHERE p.tenant.id = :tenantId
""")
Double getTotalRevenueByTenant(
        @Param("tenantId") Long tenantId
);
  

List<Payment> findAll();
   @Query("""
SELECT COUNT(p)
FROM Payment p
WHERE p.tenant.id = :tenantId
""")
Long countByTenantId(Long tenantId);
}