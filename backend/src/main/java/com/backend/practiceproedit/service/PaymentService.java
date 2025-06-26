package com.backend.practiceproedit.service;

import com.paypal.orders.*;
import com.paypal.http.HttpResponse;
import com.paypal.http.exceptions.HttpException;
import com.paypal.http.serializer.Json;
import org.springframework.http.HttpStatus;
import com.paypal.core.PayPalHttpClient;
import com.paypal.core.PayPalEnvironment;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.backend.practiceproedit.model.Payment;
import com.backend.practiceproedit.model.Notification;
import com.backend.practiceproedit.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.cloud.Timestamp;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import java.io.ByteArrayOutputStream;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.property.HorizontalAlignment;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.borders.SolidBorder;

import java.io.InputStream;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import com.google.cloud.firestore.Query;

@Service
public class PaymentService {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PayPalHttpClient payPalHttpClient;

    public Map<String, String> createPayment(Payment payment) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference paymentsRef = db.collection("projects")
                .document(payment.getProjectId())
                .collection("payments");
        DocumentReference newDoc = paymentsRef.document();
        String paymentId = newDoc.getId();

        Map<String, Object> data = new HashMap<>();
        data.put("paymentId", paymentId);
        data.put("projectId", payment.getProjectId());
        data.put("projectTitle", payment.getProjectTitle());
        data.put("clientId", payment.getClientId());
        data.put("clientUsername", payment.getClientUsername());
        data.put("editorId", payment.getEditorId());
        data.put("editorUsername", payment.getEditorUsername());
        data.put("amount", payment.getAmount());
        data.put("description", payment.getDescription());
        data.put("status", "pending_client_payment");
        data.put("createdAt", FieldValue.serverTimestamp());
        data.put("privateDrive", payment.getPrivateDrive());
        newDoc.set(data).get();

        // Create a notification for the client
        Notification notification = new Notification();
        notification.setUserId(payment.getClientId());
        notification.setType("payment");
        notification.setMessage("A new payment is issued for your project: " + payment.getProjectTitle());
        notification.setRelatedId(payment.getProjectId());
        notification.setRead(false);
        notification.setTimestamp(Timestamp.now());
        notificationService.createNotification(notification);

        // Generate PayPal approval link
        String currency = "MYR";
        String approvalLink = createPayPalOrder(paymentId, payment.getAmount(), currency);

        // Optional: store it in Firestore
        newDoc.update("paypalApprovalUrl", approvalLink);

        // Return both
        Map<String, String> response = new HashMap<>();
        response.put("paymentId", paymentId);
        response.put("paypalApprovalUrl", approvalLink);

        return response;
    }

    public Map<String, Object> getLatestPaymentForProject(String projectId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        CollectionReference paymentsRef = db.collection("projects")
                .document(projectId)
                .collection("payments");

        Query query = paymentsRef.orderBy("createdAt", Query.Direction.DESCENDING).limit(1);
        List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();

        if (!docs.isEmpty()) {
            return docs.get(0).getData();
        }

        return null;
    }

    public List<Map<String, Object>> getAllPaymentsForProject(String projectId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference payments = db.collection("projects").document(projectId).collection("payments");

        CollectionReference paymentsRef = db.collection("projects").document(projectId).collection("payments");
        Query query = paymentsRef.orderBy("createdAt", Query.Direction.DESCENDING);

        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Map<String, Object>> results = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            results.add(doc.getData());
        }

        return results;
    }

    public List<Map<String, Object>> getAllPaymentsAcrossProjects() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<Map<String, Object>> allPayments = new ArrayList<>();

        ApiFuture<QuerySnapshot> projectsSnap = db.collection("projects").get();
        for (DocumentSnapshot projectDoc : projectsSnap.get().getDocuments()) {
            CollectionReference paymentsRef = projectDoc.getReference().collection("payments");
            List<QueryDocumentSnapshot> payments = paymentsRef.get().get().getDocuments();
            for (QueryDocumentSnapshot payDoc : payments) {
                allPayments.add(payDoc.getData());
            }
        }

        return allPayments;
    }

    // Deleting a payment
    public String deletePayment(String projectId, String paymentId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();

        DocumentReference paymentDoc = db.collection("projects")
                .document(projectId)
                .collection("payments")
                .document(paymentId);

        ApiFuture<WriteResult> writeResult = paymentDoc.delete();
        writeResult.get(); // wait for deletion to complete

        return "Payment deleted successfully.";
    }

    // Generate invoive
    public byte[] generateInvoice(String projectId, String paymentId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot doc = db.collection("projects")
                .document(projectId)
                .collection("payments")
                .document(paymentId).get().get();

        if (!doc.exists())
            throw new Exception("Payment not found");

        Map<String, Object> data = doc.getData();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // 1. Add Logo (bigger)
        InputStream logoStream = getClass().getClassLoader().getResourceAsStream("static/Proedit_Logo.png");
        if (logoStream != null) {
            byte[] logoBytes = logoStream.readAllBytes();
            Image logo = new Image(ImageDataFactory.create(logoBytes))
                    .scaleToFit(180, 180)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(logo);
        }

        // 2. Company Description
        document.add(new Paragraph("Eflix Enterprise Sdn. Bhd. in Collaboration with ProEdit System")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(11));

        document.add(new Paragraph("We care, we contribute: Enhancing Learning")
                .setBold()
                .setItalic()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setMarginBottom(20));

        // 3. Invoice Title
        document.add(new Paragraph("Payment Invoice")
                .setTextAlignment(TextAlignment.CENTER)
                .setBold()
                .setFontSize(16)
                .setMarginBottom(15));

        // 4. Payment Details Table
        Table table = new Table(UnitValue.createPercentArray(new float[] { 1, 2 }))
                .useAllAvailableWidth()
                .setBorder(new SolidBorder(1));

        table.addCell("Invoice ID").addCell(paymentId);
        table.addCell("Project Title").addCell((String) data.get("projectTitle"));
        table.addCell("Client").addCell((String) data.get("clientUsername"));
        table.addCell("Editor").addCell((String) data.get("editorUsername"));
        table.addCell("Amount").addCell("RM " + data.get("amount"));
        table.addCell("Status").addCell((String) data.get("status"));

        document.add(table);

        // 5. Footer
        document.add(new Paragraph("\nThank you for working with Eflix!")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setItalic());

        document.close();
        return out.toByteArray();
    }

    // Overall total earnings
    public double getTotalEarnings() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        double total = 0.0;

        ApiFuture<QuerySnapshot> projectsSnap = db.collection("projects").get();
        for (DocumentSnapshot projectDoc : projectsSnap.get().getDocuments()) {
            CollectionReference paymentsRef = projectDoc.getReference().collection("payments");
            List<QueryDocumentSnapshot> payments = paymentsRef.get().get().getDocuments();

            for (QueryDocumentSnapshot paymentDoc : payments) {
                String status = paymentDoc.getString("status");
                Double amount = paymentDoc.getDouble("amount");

                if ("paid".equalsIgnoreCase(status) && amount != null) {
                    total += amount;
                }
            }
        }

        return total;
    }

    // Unpaid Total for Clients
    public double getUnpaidTotalByClient(String clientId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        double total = 0.0;

        ApiFuture<QuerySnapshot> projectsSnap = db.collection("projects").get();
        for (DocumentSnapshot projectDoc : projectsSnap.get().getDocuments()) {
            CollectionReference paymentsRef = projectDoc.getReference().collection("payments");
            List<QueryDocumentSnapshot> payments = paymentsRef.get().get().getDocuments();

            for (QueryDocumentSnapshot paymentDoc : payments) {
                String status = paymentDoc.getString("status");
                String pClientId = paymentDoc.getString("clientId");
                Double amount = paymentDoc.getDouble("amount");

                if (clientId.equals(pClientId) && !"paid".equalsIgnoreCase(status) && amount != null) {
                    total += amount;
                }
            }
        }

        return total;
    }

    public String createPayPalOrder(String paymentId, double amount, String currency) throws Exception {
        OrdersCreateRequest request = new OrdersCreateRequest();
        request.header("prefer", "return=representation");
        request.requestBody(new OrderRequest()
                .checkoutPaymentIntent("CAPTURE")
                .purchaseUnits(Arrays.asList(new PurchaseUnitRequest()
                        .referenceId(paymentId)
                        .amountWithBreakdown(new AmountWithBreakdown()
                                .currencyCode(currency)
                                .value(String.format("%.2f", amount))))));

        HttpResponse<Order> response = payPalHttpClient.execute(request);

        String approvalLink = null;
        for (LinkDescription link : response.result().links()) {
            if (link.rel().equals("approve")) {
                approvalLink = link.href();
                break;
            }
        }

        return approvalLink; // You can return this to frontend to let client make the payment
    }

    public List<Map<String, Object>> getPaymentsByProjectId(String projectId) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<Map<String, Object>> enrichedPayments = new ArrayList<>();

        // Get project details
        DocumentSnapshot projectSnapshot = db.collection("projects").document(projectId).get().get();
        String privateDrive = projectSnapshot.contains("privateDrive") ? projectSnapshot.getString("privateDrive")
                : null;
        String projectTitle = projectSnapshot.contains("title") ? projectSnapshot.getString("title") : null;

        // Get all payments
        CollectionReference paymentsRef = db.collection("projects").document(projectId).collection("payments");
        List<QueryDocumentSnapshot> paymentDocs = paymentsRef.get().get().getDocuments();

        for (QueryDocumentSnapshot doc : paymentDocs) {
            Map<String, Object> payment = doc.getData();
            payment.put("paymentId", doc.getId());
            payment.put("projectId", projectId);
            payment.put("projectTitle", projectTitle); // optional
            payment.put("privateDrive", privateDrive); // ✅ add this here
            enrichedPayments.add(payment);
        }

        return enrichedPayments;
    }

}
