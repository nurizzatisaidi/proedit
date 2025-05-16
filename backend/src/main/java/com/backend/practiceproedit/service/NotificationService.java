package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Notification;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class NotificationService {

    @Autowired
    private FirebaseService firebaseService;

    private final String COLLECTION_NAME = "notifications";

    public List<Map<String, Object>> getNotificationsByUserId(String userId)
            throws ExecutionException, InterruptedException {
        Firestore firestore = firebaseService.getFirestore();
        try {
            Query query = firestore.collection("notifications")
                    .whereEqualTo("userId", userId);
            // .orderBy("timestamp", Query.Direction.DESCENDING);

            ApiFuture<QuerySnapshot> querySnapshot = query.get();

            List<Map<String, Object>> notifications = new ArrayList<>();
            for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
                Map<String, Object> data = doc.getData();
                if (data != null) {
                    data.put("notificationId", doc.getId());
                    notifications.add(data);
                }
            }

            return notifications;
        } catch (Exception e) {
            System.err.println("❌ Error fetching notifications for userId: " + userId);
            e.printStackTrace(); // print actual error
            return Collections.emptyList(); // fallback to empty list
        }
    }

    public String createNotification(Notification notification) throws ExecutionException, InterruptedException {
        Firestore firestore = firebaseService.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("userId", notification.getUserId());
        data.put("type", notification.getType());
        data.put("message", notification.getMessage());
        data.put("relatedId", notification.getRelatedId());
        data.put("read", notification.isRead());
        data.put("timestamp", notification.getTimestamp() != null ? notification.getTimestamp() : Timestamp.now());

        DocumentReference docRef = firestore.collection(COLLECTION_NAME).add(data).get();
        return docRef.getId();
    }

    public boolean markAsRead(String notificationId) {
        try {
            Firestore firestore = firebaseService.getFirestore();
            firestore.collection(COLLECTION_NAME)
                    .document(notificationId)
                    .update("read", true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void deleteNotification(String notificationId) throws ExecutionException, InterruptedException {
        Firestore firestore = firebaseService.getFirestore();
        firestore.collection(COLLECTION_NAME).document(notificationId).delete().get();
    }
}
