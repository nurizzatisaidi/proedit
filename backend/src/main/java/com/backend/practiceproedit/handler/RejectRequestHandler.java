// package com.backend.practiceproedit.handler;

// import com.backend.practiceproedit.model.Request;
// import com.google.cloud.firestore.DocumentReference;
// import com.google.cloud.firestore.Firestore;

// public class RejectRequestHandler implements RequestHandler {
//     @Override
//     public void handleRequest(Firestore db, Request request) throws Exception {
//         request.setStatus("Rejected");

//         DocumentReference requestRef = db.collection("requests").document(request.getRequestId());
//         requestRef.update("status", "Rejected", "rejectionReason", request.getRejectionReason());

//     }
// }

package com.backend.practiceproedit.handler;

import com.backend.practiceproedit.model.Notification;
import com.backend.practiceproedit.model.Request;
import com.backend.practiceproedit.service.NotificationService;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;

public class RejectRequestHandler implements RequestHandler {

    private final NotificationService notificationService;

    public RejectRequestHandler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public void handleRequest(Firestore db, Request request) throws Exception {
        db.collection("requests").document(request.getRequestId())
                .update("status", "Rejected", "rejectionReason", request.getRejectionReason());

        Notification notif = new Notification(
                request.getUserId(), "request",
                "Your request has been rejected. Reason: " + request.getRejectionReason(),
                request.getRequestId(), false, Timestamp.now());

        notificationService.createNotification(notif);
    }
}
