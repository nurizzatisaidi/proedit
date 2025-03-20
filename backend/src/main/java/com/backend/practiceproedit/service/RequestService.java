
package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.api.core.ApiFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.ArrayList;
import java.util.List;

import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class RequestService {

    @Autowired
    private FirebaseService firebaseService;

    // Create a new request in Firebase
    public String createRequest(Request request) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        // Generating a uniwue requestId
        String requestId = UUID.randomUUID().toString();
        request.setRequestId(requestId);
        request.setStatus("Under Review");
        request.setCreatedAt(Timestamp.now());

        // Saving the request in Firestore under 'requests' collection
        DocumentReference docRef = db.collection("requests").document(requestId);
        ApiFuture<com.google.cloud.firestore.WriteResult> result = docRef.set(request);

        result.get();
        return requestId;
    }

    // Get the list of request in Firebase
    public List<Request> getRequestByUserId(String userId) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        System.out.println("Fetching requests for userId: " + userId);

        // ✅ Query Firestore collection for requests matching userId
        Query query = db.collection("requests").whereEqualTo("userId", userId);
        ApiFuture<QuerySnapshot> future = query.get();
        QuerySnapshot snapshot = future.get();

        System.out.println("Number of documents found: " + snapshot.size());

        List<Request> requests = new ArrayList<>();
        for (QueryDocumentSnapshot document : snapshot.getDocuments()) {
            System.out.println("Document data: " + document.getData()); // ✅ Debugging
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
}
