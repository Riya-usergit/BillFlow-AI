// package com.billFlow.billFlow.controller;

// import com.billFlow.billFlow.service.PdfService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.web.bind.annotation.*;

// import jakarta.servlet.http.HttpServletResponse;
// import java.io.OutputStream;

// @RestController
// @RequestMapping("/api/invoices")
// @RequiredArgsConstructor
// public class PdfController {

//     private final PdfService pdfService;

//     @GetMapping("/{id}/pdf")
//     public void downloadInvoicePdf(
//             @PathVariable Long id,
//             HttpServletResponse response) {

//         try {
//             byte[] pdf = pdfService.generateInvoicePdf(id);

//             response.setContentType("application/pdf");
//             response.setHeader("Content-Disposition",
//                     "attachment; filename=invoice_" + id + ".pdf");

//             OutputStream out = response.getOutputStream();
//             out.write(pdf);
//             out.flush();

//         } catch (Exception e) {
//             throw new RuntimeException(e);
//         }
//     }
