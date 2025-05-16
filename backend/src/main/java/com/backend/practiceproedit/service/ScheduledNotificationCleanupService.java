package com.backend.practiceproedit.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class ScheduledNotificationCleanupService {

    @Autowired
    private FirebaseService firebaseService;

    private final String COLLECTION_NAME = "notifications";

    // Run once a day (every 24 hours)
    @Scheduled(cron = "0 0 2 * * ?") // 2 AM daily
    public void cleanOldNotifications() {
        Firestore db = firebaseService.getFirestore();

        // Calculate timestamp for 7 days ago
        long millisInAWeek = 7L * 24 * 60 * 60 * 1000;
        Date thresholdDate = new Date(System.currentTimeMillis() - millisInAWeek);

        try {
            Query query = db.collection(COLLECTION_NAME)
                    .whereLessThan("timestamp", Timestamp.of(thresholdDate));
            List<QueryDocumentSnapshot> oldDocs = query.get().get().getDocuments();

            for (DocumentSnapshot doc : oldDocs) {
                db.collection(COLLECTION_NAME).document(doc.getId()).delete();
                System.out.println("Deleted old notification: " + doc.getId());
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}
