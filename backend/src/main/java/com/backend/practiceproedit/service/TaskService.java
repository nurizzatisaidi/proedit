package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Task;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import com.backend.practiceproedit.model.Notification;
import com.backend.practiceproedit.service.NotificationService;
import com.backend.practiceproedit.service.FirebaseService;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import java.util.UUID;
import com.google.cloud.Timestamp;

@Service
public class TaskService {

    private final Firestore db;
    private final FirebaseService firebaseService;
    private final NotificationService notificationService;

    public TaskService(FirebaseService firebaseService, NotificationService notificationService) {
        this.firebaseService = firebaseService;
        this.db = firebaseService.getFirestore();
        this.notificationService = notificationService;
    }

    // Create a new task under a specific project (sub-collection)
    public String createTask(String projectId, Task task) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();

        String taskId = UUID.randomUUID().toString();
        task.setTaskId(taskId);
        task.setProjectId(projectId);
        task.setCreatedAt(new java.util.Date());

        if (task.getDueDate() == null) {
            throw new IllegalArgumentException("Due date is required for a task.");
        }

        // Save to Firestore
        db.collection("projects").document(projectId).collection("tasks").document(taskId).set(task).get();

        // 🔔 Fetch project to get client and admin IDs
        DocumentSnapshot projectDoc = db.collection("projects").document(projectId).get().get();
        if (projectDoc.exists()) {
            String clientId = projectDoc.getString("userId");
            String adminId = "ADMIN_STATIC_ID"; // Change this if you have a real admin userId stored

            String message = "A new task was added to project: " + projectDoc.getString("title");

            Notification clientNotif = new Notification(clientId, "task", message, projectId, false, Timestamp.now());
            Notification adminNotif = new Notification(adminId, "task", message, projectId, false, Timestamp.now());

            notificationService.createNotification(clientNotif);
            notificationService.createNotification(adminNotif);
        }

        return taskId;
    }

    // Get all tasks under a specific project
    public List<Task> getTasksByProject(String projectId) throws ExecutionException, InterruptedException {
        CollectionReference taskRef = db.collection("projects").document(projectId).collection("tasks");
        ApiFuture<QuerySnapshot> future = taskRef.get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();

        List<Task> tasks = new ArrayList<>();
        for (DocumentSnapshot doc : docs) {
            Task task = doc.toObject(Task.class);
            task.setTaskId(doc.getId());
            tasks.add(task);
        }

        return tasks;
    }

    // Update a task by its ID
    public void updateTask(String projectId, String taskId, Task updatedTask)
            throws ExecutionException, InterruptedException {

        db.collection("projects").document(projectId).collection("tasks")
                .document(taskId).set(updatedTask).get();

        // 🔔 Send notification
        DocumentSnapshot projectDoc = db.collection("projects").document(projectId).get().get();
        if (projectDoc.exists()) {
            String clientId = projectDoc.getString("userId");
            String adminId = "ADMIN_STATIC_ID"; // Replace with dynamic adminId if available

            String message = "A task was updated in project: " + projectDoc.getString("title");

            Notification clientNotif = new Notification(clientId, "task", message, projectId, false, Timestamp.now());
            Notification adminNotif = new Notification(adminId, "task", message, projectId, false, Timestamp.now());

            notificationService.createNotification(clientNotif);
            notificationService.createNotification(adminNotif);
        }
    }

    // Delete a task by its ID
    public void deleteTask(String projectId, String taskId) throws ExecutionException, InterruptedException {
        db.collection("projects").document(projectId).collection("tasks")
                .document(taskId).delete().get();
    }
}
