package com.billFlow.billFlow.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendInvoiceEmail(
            String toEmail,
            String invoiceNumber,
            byte[] pdfBytes) {

        try {

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true);

            helper.setTo(toEmail);

            helper.setSubject(
                    "Invoice " + invoiceNumber
            );

            helper.setText(
                    """
                    Hello,

                    Please find your invoice attached.

                    Regards,
                    BillFlow AI
                    """
            );

            helper.addAttachment(
                    invoiceNumber + ".pdf",
                    new ByteArrayResource(pdfBytes)
            );

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("EMAIL ERROR: " + e.getClass().getName());
            System.err.println("EMAIL ERROR MSG: " + e.getMessage());
            System.err.println("WARNING: Failed to send invoice email (SMTP might be blocked). Proceeding without throwing exception.");
        }
    }
    public void sendEmail(
        String toEmail,
        String subject,
        String body) {

    try {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

    } catch (Exception e) {
        e.printStackTrace();
        System.err.println("EMAIL ERROR: " + e.getClass().getName());
        System.err.println("EMAIL ERROR MSG: " + e.getMessage());
        System.err.println("WARNING: Failed to send email (SMTP might be blocked). Proceeding without throwing exception.");
    }
}
    
}