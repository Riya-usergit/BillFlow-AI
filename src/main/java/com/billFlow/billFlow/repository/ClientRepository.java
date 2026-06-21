package com.billFlow.billFlow.repository;

import com.billFlow.billFlow.entity.Client;
import com.billFlow.billFlow.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;


public interface ClientRepository
        extends JpaRepository<Client, Long> {

  List<Client> findByTenant_Id(Long tenantId);

Optional<Client> findByIdAndTenant_Id(Long id, Long tenantId);
long count();
Long countByTenantId(Long tenantId);
}