
package com.backend.practiceproedit.service;

import com.backend.practiceproedit.handler.RequestHandler;
import com.backend.practiceproedit.handler.RequestHandlerFactory;
import com.backend.practiceproedit.model.Request;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Service;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;
import com.backend.practiceproedit.model.Notification;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class RequestService {

    private final Firestore db;
    private final FirebaseService firebaseService;

    private final NotificationService notificationService;

    public RequestService(FirebaseService firebaseService, NotificationService notificationService) {
        this.db = firebaseService.getFirestore();
        this.firebaseService = firebaseService;
        this.notificationService = notificationService;
    }

    // Create a new request in Firebase
    public String createRequest(Request request) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        String requestId = UUID.randomUUID().toString();
        request.setRequestId(requestId);
        request.setStatus("Pending");
        request.setCreatedAt(Timestamp.now());

        String username = firebaseService.getUsernameById(request.getUserId());
        request.setUsername(username);

        request.setAdminComment(null);
        request.setAssignedEditor(null);
        request.setAssignedEditorUsername(null);
        request.setRejectionReason(null);

        DocumentReference docRef = db.collection("requests").document(requestId);
        ApiFuture<com.google.cloud.firestore.WriteResult> result = docRef.set(request);
        result.get();

        // Send notification to all admins
        List<String> adminUserIds = firebaseService.getAllUserIdsByRole("admin");
        for (String adminId : adminUserIds) {
            Notification notification = new Notification(
                    adminId,
                    "request",
                    "New request submitted by " + username,
                    requestId,
                    false,
                    Timestamp.now());
            notificationService.createNotification(notification);
        }

        return requestId;
    }

    // Get the list of request in Firebase
    public List<Request> getRequestByUserId(String userId) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        System.out.println("Fetching requests for userId: " + userId);

        // Query Firestore collection for requests matching userId
        Query query = db.collection("requests").whereEqualTo("userId", userId);
        ApiFuture<QuerySnapshot> future = query.get();
        QuerySnapshot snapshot = future.get();

        System.out.println("Number of documents found: " + snapshot.size());

        List<Request> requests = new ArrayList<>();
        for (QueryDocumentSnapshot document : snapshot.getDocuments()) {
            System.out.println("Document data: " + document.getData());
            requests.add(document.toObject(Request.class));
        }
        return requests;
    }

    // Get All the requests
    public List<Request> getAllRequests() throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        ApiFuture<QuerySnapshot> future = db.collection("requests").get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Request> requests = new ArrayList<>();

        for (QueryDocumentSnapshot document : documents) {
            requests.add(document.toObject(Request.class));
        }

        return requests;
    }

    // Deleting a request
    public boolean deleteRequest(String requestId) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        DocumentReference docRef = db.collection("requests").document(requestId);

        if (docRef.get().get().exists()) {
            docRef.delete();
            return true;
        }
        return false;
    }

    // Process the Request made by Admin
    public void processRequest(String requestId, String status, String comment, String editorId, String adminUserId)
            throws Exception {
        DocumentReference docRef = db.collection("requests").document(requestId);
        Request request = docRef.get().get().toObject(Request.class);

        if (request != null) {
            request.setStatus(status);
            request.setAdminComment(comment);

            if ("Accepted".equals(status)) {
                String username = firebaseService.getUsernameById(request.getUserId());
                request.setUsername(username);
                request.setAssignedEditor(editorId);
                String editorUsername = firebaseService.getUsernameById(editorId);
                request.setAssignedEditorUsername(editorUsername);
                request.setAdminUserId(adminUserId); // Set adminUserId in the Request object
            } else if ("Rejected".equals(status)) {
                request.setRejectionReason(comment);
            }

            // Factory that injects notification service
            RequestHandlerFactory factory = new RequestHandlerFactory(notificationService);
            RequestHandler handler = factory.getHandler(status);
            handler.handleRequest(db, request);
        }
    }

}
