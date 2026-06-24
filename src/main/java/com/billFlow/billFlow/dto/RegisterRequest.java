package com.billFlow.billFlow.dto;
import com.billFlow.billFlow.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String companyName;
    private Role role;
}