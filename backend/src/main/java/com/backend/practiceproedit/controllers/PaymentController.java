package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Payment;
import com.backend.practiceproedit.service.PaymentService;
import com.backend.practiceproedit.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.cloud.firestore.DocumentSnapshot;
import com.backend.practiceproedit.model.Notification;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.FieldValue;
import com.backend.practiceproedit.service.NotificationService;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<String> createPayment(@RequestBody Payment payment) {
        try {
            String paymentId = paymentService.createPayment(payment);
            return ResponseEntity.ok(paymentId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create payment: " + e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<Map<String, Object>> getLatestPayment(@PathVariable String projectId) {
        try {
            Map<String, Object> payment = paymentService.getLatestPaymentForProject(projectId);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/project/{projectId}/all")
    public ResponseEntity<List<Map<String, Object>>> getAllPayments(@PathVariable String projectId) {
        try {
            List<Map<String, Object>> payments = paymentService.getAllPaymentsForProject(projectId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/all-projects-payments")
    public ResponseEntity<List<Map<String, Object>>> getAllProjectPayments() {
        try {
            List<Map<String, Object>> all = paymentService.getAllPaymentsAcrossProjects();
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{projectId}/{paymentId}")
    public ResponseEntity<String> deletePayment(@PathVariable String projectId, @PathVariable String paymentId) {
        try {
            String message = paymentService.deletePayment(projectId, paymentId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to delete payment: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@RequestBody Map<String, String> request) {
        String paymentId = request.get("paymentId");
        String projectId = request.get("projectId");
        String paypalTransactionId = request.get("paypalTransactionId");

        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference paymentRef = db.collection("projects")
                    .document(projectId)
                    .collection("payments")
                    .document(paymentId);

            Map<String, Object> updates = new HashMap<>();
            updates.put("status", "paid");
            updates.put("paypalTransactionId", paypalTransactionId);
            updates.put("paidAt", FieldValue.serverTimestamp());

            // Fetch project info to get project title & client username
            DocumentSnapshot projectDoc = db.collection("projects").document(projectId).get().get();
            String projectTitle = projectDoc.getString("title");
            String clientUsername = projectDoc.getString("username");

            // 🔁 Dynamically get all admin users
            List<QueryDocumentSnapshot> adminUsers = db.collection("users")
                    .whereEqualTo("role", "admin")
                    .get()
                    .get()
                    .getDocuments();

            for (QueryDocumentSnapshot adminDoc : adminUsers) {
                String adminId = adminDoc.getId();

                Notification notification = new Notification();
                notification.setUserId(adminId);
                notification.setType("payment");
                notification.setMessage("Client " + clientUsername + " has paid for project: " + projectTitle);
                notification.setRelatedId(projectId);
                notification.setRead(false);
                notification.setTimestamp(com.google.cloud.Timestamp.now());

                notificationService.createNotification(notification);
            }

            paymentRef.update(updates).get();

            // Check and update project status if all payments are paid
            projectService.updateProjectStatusIfAllPaymentsPaid(projectId);

            return ResponseEntity.ok("Payment confirmed.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error confirming payment.");
        }
    }

    // Downloading invoice per payment
    @GetMapping("/invoice/{projectId}/{paymentId}")
    public ResponseEntity<byte[]> generateInvoice(
            @PathVariable String projectId,
            @PathVariable String paymentId) {
        try {
            byte[] pdfData = paymentService.generateInvoice(projectId, paymentId);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=invoice_" + paymentId + ".pdf")
                    .body(pdfData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get the total earnings from paid projects
    @GetMapping("/total-earnings")
    public ResponseEntity<Double> getTotalEarnings() {
        try {
            double total = paymentService.getTotalEarnings();
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(0.0);
        }
    }

}