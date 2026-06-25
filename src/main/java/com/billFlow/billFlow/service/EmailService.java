package com.billFlow.billFlow.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.from.email:riyamprajapati@gmail.com}")
    private String brevoFromEmail;

    public void sendInvoiceEmail(
            String toEmail,
            String invoiceNumber,
            byte[] pdfBytes) {

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                System.out.println("Attempting to send invoice email via Brevo API...");
                HttpClient client = HttpClient.newHttpClient();
                String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
                
                String jsonPayload = """
                    {
                      "sender": {
                        "name": "BillFlow AI",
                        "email": "%s"
                      },
                      "to": [
                        {
                          "email": "%s"
                        }
                      ],
                      "subject": "Invoice %s",
                      "htmlContent": "<p>Hello,</p><p>Please find your invoice attached.</p><p>Regards,<br>BillFlow AI</p>",
                      "attachment": [
                        {
                          "name": "%s.pdf",
                          "content": "%s"
                        }
                      ]
                    }
                    """.formatted(brevoFromEmail, toEmail, invoiceNumber, invoiceNumber, base64Pdf);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                        .header("api-key", brevoApiKey)
                        .header("Content-Type", "application/json")
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println("Email sent successfully via Brevo API. Status code: " + response.statusCode());
                    return;
                } else {
                    System.err.println("Failed to send email via Brevo API. Status: " + response.statusCode() + ", Response: " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Error sending email via Brevo API: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Fallback to SMTP
        System.out.println("Brevo API not configured or failed. Falling back to SMTP...");
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

        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            try {
                System.out.println("Attempting to send email via Brevo API...");
                HttpClient client = HttpClient.newHttpClient();
                String jsonPayload = """
                    {
                      "sender": {
                        "name": "BillFlow AI",
                        "email": "%s"
                      },
                      "to": [
                        {
                          "email": "%s"
                        }
                      ],
                      "subject": "%s",
                      "htmlContent": "<p>%s</p>"
                    }
                    """.formatted(
                        brevoFromEmail,
                        toEmail,
                        subject.replace("\"", "\\\""),
                        body.replace("\"", "\\\"").replace("\n", "<br>")
                    );

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                        .header("api-key", brevoApiKey)
                        .header("Content-Type", "application/json")
                        .header("Accept", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    System.out.println("Email sent successfully via Brevo API. Status code: " + response.statusCode());
                    return;
                } else {
                    System.err.println("Failed to send email via Brevo API. Status: " + response.statusCode() + ", Response: " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Error sending email via Brevo API: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Fallback to SMTP
        System.out.println("Brevo API not configured or failed. Falling back to SMTP...");
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