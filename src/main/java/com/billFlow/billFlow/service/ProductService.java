 package com.billFlow.billFlow.service;

import com.billFlow.billFlow.dto.ProductRequest;
import com.billFlow.billFlow.entity.Product;
import com.billFlow.billFlow.entity.Tenant;
import com.billFlow.billFlow.entity.User;
import com.billFlow.billFlow.repository.ProductRepository;
import com.billFlow.billFlow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Product createProduct(
            ProductRequest request,
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow();

        Tenant tenant = user.getTenant();

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .taxRate(request.getTaxRate())
                .tenant(tenant)
                .build();

        return productRepository.save(product);
    }
public Product getProduct(
        Long productId,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    return productRepository
            .findByIdAndTenant_Id(
                    productId,
                    tenant.getId()
            )
            .orElseThrow();
}
public Product updateProduct(
        Long productId,
        ProductRequest request,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    Product product = productRepository
            .findByIdAndTenant_Id(
                    productId,
                    tenant.getId()
            )
            .orElseThrow();

    product.setName(request.getName());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    product.setTaxRate(request.getTaxRate());

    return productRepository.save(product);
}public String deleteProduct(
        Long productId,
        String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    Tenant tenant = user.getTenant();

    Product product = productRepository
            .findByIdAndTenant_Id(
                    productId,
                    tenant.getId()
            )
            .orElseThrow();

    productRepository.delete(product);

    return "Product deleted successfully";
}
public List<Product> getProducts(String email) {

    User user = userRepository
            .findByEmail(email)
            .orElseThrow();

    return productRepository
            .findByTenant(user.getTenant());
}
} 