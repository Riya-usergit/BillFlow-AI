package com.billFlow.billFlow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.billFlow.billFlow.dto.ClientRequest;

import com.billFlow.billFlow.entity.User;

import java.util.List;
import com.billFlow.billFlow.entity.Client;
import com.billFlow.billFlow.entity.Tenant;
import com.billFlow.billFlow.repository.ClientRepository;
import com.billFlow.billFlow.repository.TenantRepository;
import com.billFlow.billFlow.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ClientService {
private final ClientRepository clientRepository;
private final UserRepository userRepository;
private final TenantRepository tenantRepository;

   public Client createClient(
        ClientRequest request,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();
System.out.println("User Email = " + user.getEmail());
System.out.println("Tenant = " + user.getTenant());
    Tenant tenant = user.getTenant();

    Client client = Client.builder()
            .name(request.getName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .companyName(request.getCompanyName())
            .gstNumber(request.getGstNumber())
            .address(request.getAddress())
            .tenant(tenant)
            .build();

    return clientRepository.save(client);
}

public List<Client> getClients(String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    return clientRepository.findByTenant_Id(
            tenant.getId()
    );
}
public Client getClient(Long clientId, String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    return clientRepository
            .findByIdAndTenant_Id(
                    clientId,
                    tenant.getId()
            )
            .orElseThrow();
}
public Client updateClient(
        Long clientId,
        ClientRequest request,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    Client client = clientRepository
            .findByIdAndTenant_Id(
                    clientId,
                    tenant.getId()
            )
            .orElseThrow();

    client.setName(request.getName());
    client.setEmail(request.getEmail());
    client.setPhone(request.getPhone());
client.setCompanyName(request.getCompanyName());
client.setGstNumber(request.getGstNumber());
client.setAddress(request.getAddress());
    return clientRepository.save(client);

        }

    
        public String deleteClient(
        Long clientId,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    Client client = clientRepository
            .findByIdAndTenant_Id(
                    clientId,
                    tenant.getId()
            )
            .orElseThrow();

    clientRepository.delete(client);

    return "Client deleted successfully";
}
}