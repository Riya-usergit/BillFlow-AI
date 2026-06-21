
package com.billFlow.billFlow.repository;

import com.billFlow.billFlow.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    List<Product> findByTenant_Id(Long tenantId);

    Optional<Product> findByIdAndTenant_Id(
            Long productId,
            Long tenantId);
} 
    

