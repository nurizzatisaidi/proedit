package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Payment;
import com.backend.practiceproedit.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

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

}