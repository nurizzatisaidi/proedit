package com.backend.practiceproedit.service;

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

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

import com.google.cloud.firestore.Query;

@Service
public class PaymentService {

    @Autowired
    private NotificationService notificationService;

    public String createPayment(Payment payment) throws Exception {
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

        // 🔔 Create a notification for the client
        Notification notification = new Notification();
        notification.setUserId(payment.getClientId());
        notification.setType("payment");
        notification.setMessage("A new payment is issued for your project: " + payment.getProjectTitle());
        notification.setRelatedId(payment.getProjectId());
        notification.setRead(false);
        notification.setTimestamp(Timestamp.now());
        notificationService.createNotification(notification);

        return paymentId;
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

}
