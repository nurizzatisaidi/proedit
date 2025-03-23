package com.backend.practiceproedit.handler;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;

public class RejectRequestHandler implements RequestHandler {
    @Override
    public void handleRequest(Firestore db, Request request) throws Exception {
        request.setStatus("Rejected");

        DocumentReference requestRef = db.collection("requests").document(request.getRequestId());
        requestRef.update("status", "Rejected", "rejectionReason", request.getRejectionReason());

    }
}
