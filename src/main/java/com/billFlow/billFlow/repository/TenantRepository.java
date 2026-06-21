package com.billFlow.billFlow.repository;
import com.billFlow.billFlow.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Long> {
}