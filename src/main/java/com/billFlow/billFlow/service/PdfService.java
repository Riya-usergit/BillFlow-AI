// package com.billFlow.billFlow.service;

// import com.billFlow.billFlow.entity.Invoice;
// import com.billFlow.billFlow.entity.InvoiceItem;
// import com.billFlow.billFlow.repository.InvoiceItemRepository;
// import com.billFlow.billFlow.repository.InvoiceRepository;
// import com.lowagie.text.*;
// import com.lowagie.text.pdf.*;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;

// import java.awt.Color;
// import java.io.ByteArrayOutputStream;
// import java.util.List;
// import java.util.stream.Stream;

// @Service
// @RequiredArgsConstructor
// public class PdfService {

//     private final InvoiceRepository invoiceRepository;
//     private final InvoiceItemRepository invoiceItemRepository;

//     public byte[] generateInvoicePdf(Long invoiceId) {

//         try {

//             // ================= DATA =================
//             Invoice invoice = invoiceRepository.findById(invoiceId)
//                     .orElseThrow(() -> new RuntimeException("Invoice not found"));

//             List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);

//             // ================= DOCUMENT =================
//             ByteArrayOutputStream out = new ByteArrayOutputStream();
//             Document document = new Document(PageSize.A4, 36, 36, 40, 40);
//             PdfWriter.getInstance(document, out);

//             document.open();

//             // ================= FONTS =================
//             Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
//             Font h1 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
//             Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);

//             // ================= HEADER (Stripe style) =================
//             Paragraph brand = new Paragraph("BILLFLOW AI", title);
//             brand.setSpacingAfter(5);
//             document.add(brand);

//             Paragraph sub = new Paragraph("Invoice", h1);
//             sub.setSpacingAfter(15);
//             document.add(sub);

//             // ================= INVOICE META BOX =================
//             PdfPTable meta = new PdfPTable(2);
//             meta.setWidthPercentage(100);
//             meta.setSpacingAfter(15);

//             PdfPCell left = new PdfPCell();
//             left.setBorder(Rectangle.NO_BORDER);
//             left.addElement(new Paragraph("Billed To", h1));

//             if (invoice.getClient() != null) {
//                 left.addElement(new Paragraph(invoice.getClient().getName(), normal));
//                 left.addElement(new Paragraph(invoice.getClient().getEmail(), normal));
//             }

//             PdfPCell right = new PdfPCell();
//             right.setBorder(Rectangle.NO_BORDER);
//             right.setHorizontalAlignment(Element.ALIGN_RIGHT);

//             right.addElement(new Paragraph("Invoice #: " + invoice.getInvoiceNumber(), normal));
//             right.addElement(new Paragraph("Issue Date: " + invoice.getIssueDate(), normal));
//             right.addElement(new Paragraph("Due Date: " + invoice.getDueDate(), normal));
//             right.addElement(new Paragraph("Status: " + invoice.getStatus(), normal));

//             meta.addCell(left);
//             meta.addCell(right);

//             document.add(meta);

//             // ================= ITEMS TABLE =================
//             PdfPTable table = new PdfPTable(4);
//             table.setWidthPercentage(100);
//             table.setSpacingBefore(10);
//             table.setSpacingAfter(20);
//             table.setWidths(new float[]{4f, 1f, 2f, 2f});

//             Stream.of("Description", "Qty", "Unit Price", "Amount").forEach(h -> {
//                 PdfPCell cell = new PdfPCell(new Phrase(h, h1));
//                 cell.setBackgroundColor(new Color(245, 245, 245)); // Stripe light gray
//                 cell.setPadding(8);
//                 cell.setBorderColor(new Color(220, 220, 220));
//                 table.addCell(cell);
//             });

//             double subtotal = 0.0;

//             for (InvoiceItem item : items) {

//                 String product = (item.getProduct() != null)
//                         ? item.getProduct().getName()
//                         : "Unknown Product";

//                 table.addCell(new PdfPCell(new Phrase(product, normal)));
//                 table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normal)));
//                 table.addCell(new PdfPCell(new Phrase("₹ " + item.getUnitPrice(), normal)));
//                 table.addCell(new PdfPCell(new Phrase("₹ " + item.getAmount(), normal)));

//                 subtotal += item.getAmount();
//             }

//             document.add(table);

//             // ================= TOTAL BOX (Stripe style right aligned) =================
//             double gst = subtotal * 0.18;
//             double total = subtotal + gst;

//             PdfPTable totalTable = new PdfPTable(2);
//             totalTable.setWidthPercentage(40);
//             totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

//             totalTable.addCell(getCell("Subtotal", normal));
//             totalTable.addCell(getCell("₹ " + subtotal, normal));

//             totalTable.addCell(getCell("GST (18%)", normal));
//             totalTable.addCell(getCell("₹ " + gst, normal));

//             PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL", h1));
//             PdfPCell totalValue = new PdfPCell(new Phrase("₹ " + total, h1));

//             totalLabel.setBorderColor(new Color(200, 200, 200));
//             totalValue.setBorderColor(new Color(200, 200, 200));

//             totalTable.addCell(totalLabel);
//             totalTable.addCell(totalValue);

//             document.add(totalTable);

//             // ================= FOOTER =================
//             Paragraph footer = new Paragraph(
//                     "Thank you for your business with BillFlow AI",
//                     FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY)
//             );

//             footer.setAlignment(Element.ALIGN_CENTER);
//             footer.setSpacingBefore(30);
//             document.add(footer);

//             document.close();

//             return out.toByteArray();

//         } catch (Exception e) {
//             e.printStackTrace();
//             throw new RuntimeException("Error generating Stripe PDF: " + e.getMessage(), e);
//         }
//     }

//     private PdfPCell getCell(String text, Font font) {
//         PdfPCell cell = new PdfPCell(new Phrase(text, font));
//         cell.setBorderColor(new Color(220, 220, 220));
//         cell.setPadding(6);
//         return cell;
//     }
// }
package com.billFlow.billFlow.service;

import com.billFlow.billFlow.entity.Invoice;
import com.billFlow.billFlow.entity.InvoiceItem;
import com.billFlow.billFlow.repository.InvoiceItemRepository;
import com.billFlow.billFlow.repository.InvoiceRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    public byte[] generateInvoicePdf(Long invoiceId) {

        try {

            // ================= FETCH DATA =================
            Invoice invoice = invoiceRepository.findById(invoiceId)
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);

            // ================= DOCUMENT =================
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 30, 30, 30, 30);
            PdfWriter.getInstance(document, out);

            document.open();

            // ================= FONTS =================
            Font companyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 9);

            // ================= HEADER =================
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);

            PdfPCell left = new PdfPCell();
            left.setBorder(Rectangle.NO_BORDER);

            left.addElement(new Paragraph("BILLFLOW AI", companyFont));
            left.addElement(new Paragraph("Smart Billing System", normal));

            PdfPCell right = new PdfPCell();
            right.setBorder(Rectangle.NO_BORDER);
            right.setHorizontalAlignment(Element.ALIGN_RIGHT);

            right.addElement(new Paragraph("INVOICE", companyFont));
            right.addElement(new Paragraph("Invoice No: " + invoice.getInvoiceNumber(), normal));
            right.addElement(new Paragraph("Date: " + invoice.getIssueDate(), normal));

            header.addCell(left);
            header.addCell(right);

            document.add(header);

            document.add(new Paragraph(" "));

            // ================= CLIENT + META =================
            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);

            PdfPCell client = new PdfPCell();
            client.setPadding(8);

            client.addElement(new Paragraph("BILL TO", bold));

            if (invoice.getClient() != null) {
                client.addElement(new Paragraph(invoice.getClient().getName(), normal));
                client.addElement(new Paragraph(invoice.getClient().getEmail(), normal));
                client.addElement(new Paragraph(invoice.getClient().getPhone(), normal));
            }

            PdfPCell info = new PdfPCell();
            info.setPadding(8);

            info.addElement(new Paragraph("DETAILS", bold));
            info.addElement(new Paragraph("Due Date: " + invoice.getDueDate(), normal));
            info.addElement(new Paragraph("Status: " + invoice.getStatus(), normal));

            meta.addCell(client);
            meta.addCell(info);

            document.add(meta);

            document.add(new Paragraph(" "));

            // ================= TABLE HEADER =================
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 1.2f, 1, 1, 1.3f, 1, 1, 1, 1.3f});

            String[] headers = {
                    "Product", "HSN", "Qty", "Rate",
                    "Taxable", "CGST%", "CGST", "SGST%", "Total"
            };

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, bold));
                cell.setBackgroundColor(new Color(235, 235, 235));
                cell.setPadding(5);
                table.addCell(cell);
            }

            // ================= DATA =================
            double subtotal = 0;
            double totalCgst = 0;
            double totalSgst = 0;
            double grandTotal = 0;

            for (InvoiceItem item : items) {

                String product = (item.getProduct() != null)
                        ? item.getProduct().getName()
                        : "Unknown";

                double taxable = item.getAmount();
                double cgst = taxable * 0.09;
                double sgst = taxable * 0.09;
                double total = taxable + cgst + sgst;

                subtotal += taxable;
                totalCgst += cgst;
                totalSgst += sgst;
                grandTotal += total;

                table.addCell(new PdfPCell(new Phrase(product, normal)));
                table.addCell(new PdfPCell(new Phrase("N/A", normal))); // HSN placeholder
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normal)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getUnitPrice()), normal)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(taxable), normal)));
                table.addCell(new PdfPCell(new Phrase("9%", normal)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(cgst), normal)));
                table.addCell(new PdfPCell(new Phrase("9%", normal)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(total), normal)));
            }

            document.add(table);

            document.add(new Paragraph(" "));

            // ================= SUMMARY =================
            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(40);
            summary.setHorizontalAlignment(Element.ALIGN_RIGHT);

            summary.addCell(cell("Subtotal", bold));
            summary.addCell(cell(String.valueOf(subtotal), normal));

            summary.addCell(cell("CGST", bold));
            summary.addCell(cell(String.valueOf(totalCgst), normal));

            summary.addCell(cell("SGST", bold));
            summary.addCell(cell(String.valueOf(totalSgst), normal));

            summary.addCell(cell("GRAND TOTAL", bold));
            summary.addCell(cell(String.valueOf(grandTotal), bold));

            document.add(summary);

            document.add(new Paragraph(" "));

            // ================= FOOTER =================
            Paragraph footer = new Paragraph(
                    "Thank you for your business with BillFlow AI",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY)
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating GST Invoice PDF: " + e.getMessage(), e);
        }
    }

    private PdfPCell cell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        return cell;
    }
}