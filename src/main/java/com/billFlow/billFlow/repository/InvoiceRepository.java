package com.billFlow.billFlow.repository;

import com.billFlow.billFlow.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByTenant_Id(Long tenantId);

    Optional<Invoice> findByIdAndTenant_Id(Long id, Long tenantId);
    @Query("SELECT COUNT(i) FROM Invoice i")
Long countInvoices();

Long countByStatus(String status);
Long countByTenantId(Long tenantId);

Long countByTenantIdAndStatus(
        Long tenantId,
        String status
);
Optional<Invoice> findByIdAndTenantId(
        Long id,
        Long tenantId
);

     @Query("""
SELECT COALESCE(SUM(i.totalAmount),0)
FROM Invoice i
WHERE i.client.id = :clientId
""")
Double getTotalRevenueByClient(Long clientId);

   @Query("""
SELECT COALESCE(SUM(i.totalAmount),0)
FROM Invoice i
WHERE i.client.id = :clientId
AND i.status <> 'PAID'
""")
Double getOutstandingAmount(Long clientId);

@Query("""
SELECT COALESCE(SUM(i.totalAmount),0)
FROM Invoice i
WHERE i.tenant.id = :tenantId
AND i.status <> 'PAID'
""")
Double getOutstandingAmountByTenant(Long tenantId);
List<Invoice> findByTenantId(Long tenantId);
@Query("SELECT i FROM Invoice i WHERE i.dueDate < :today AND i.status != 'PAID'")
List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);

@Modifying
@Query("UPDATE Invoice i SET i.status = 'OVERDUE' " +
       "WHERE i.tenant.id = :tenantId " +
       "AND i.status != 'PAID' " +
       "AND i.dueDate < :today")
int markOverdueInvoices(@Param("tenantId") Long tenantId,
                        @Param("today") LocalDate today);

                        
}