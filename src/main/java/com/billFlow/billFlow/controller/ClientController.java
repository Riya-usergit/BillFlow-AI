package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.dto.ClientRequest;
import com.billFlow.billFlow.entity.Client;
import com.billFlow.billFlow.service.ClientService;
import com.billFlow.billFlow.entity.User;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

  @PostMapping
public ResponseEntity<?> createClient(
        @RequestBody ClientRequest request,
        Authentication authentication) {

    Client client = clientService.createClient(
            request,
            authentication.getName()
    );

    return ResponseEntity.ok(client);
}
    @GetMapping
    public List<Client> getClients(
            Authentication authentication) {

        return clientService.getClients(
                authentication.getName());
    }

    @GetMapping("/{id}")
    public Client getClient(
            @PathVariable Long id,
            Authentication authentication) {

        return clientService.getClient(
                id,
                authentication.getName());
    }

    @PutMapping("/{id}")
    public Client updateClient(
            @PathVariable Long id,
            @RequestBody ClientRequest request,
            Authentication authentication) {

        return clientService.updateClient(
                id,
                request,
                authentication.getName());
    }

    @DeleteMapping("/{id}")
    public String deleteClient(
            @PathVariable Long id,
            Authentication authentication) {

        return clientService.deleteClient(
                id,
                authentication.getName());
    }
}