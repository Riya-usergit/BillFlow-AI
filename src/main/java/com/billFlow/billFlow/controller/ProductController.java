package com.billFlow.billFlow.controller;

import com.billFlow.billFlow.dto.ProductRequest;
import com.billFlow.billFlow.entity.Product;
import com.billFlow.billFlow.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Product createProduct(
            @RequestBody ProductRequest request,
            Authentication authentication) {

        return productService.createProduct(
                request,
                authentication.getName()
        );
    }
    @GetMapping("/{id}")
public Product getProduct(
        @PathVariable Long id,
        Authentication authentication) {

    return productService.getProduct(
            id,
            authentication.getName()
    );
}@PutMapping("/{id}")
public Product updateProduct(
        @PathVariable Long id,
        @RequestBody ProductRequest request,
        Authentication authentication) {

    return productService.updateProduct(
            id,
            request,
            authentication.getName()
    );
}@DeleteMapping("/{id}")
public String deleteProduct(
        @PathVariable Long id,
        Authentication authentication) {

    return productService.deleteProduct(
            id,
            authentication.getName()
    );
}

    
}