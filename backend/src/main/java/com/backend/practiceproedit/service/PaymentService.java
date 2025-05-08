package com.backend.practiceproedit.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.backend.practiceproedit.model.Payment;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    public String createPayment(Payment payment) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference newDoc = db.collection("payments").document();
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

        ApiFuture<WriteResult> result = newDoc.set(data);
        result.get();

        return paymentId;
    }
}
