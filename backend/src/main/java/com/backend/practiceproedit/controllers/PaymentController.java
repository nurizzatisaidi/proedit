package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Payment;
import com.backend.practiceproedit.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000") // Allow React to access this API
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public String createPayment(@RequestBody Payment payment) {
        try {
            return paymentService.createPayment(payment);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to create payment: " + e.getMessage();
        }
    }
}
