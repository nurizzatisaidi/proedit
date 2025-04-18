package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Task;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

import java.util.UUID;
import com.google.cloud.Timestamp;

@Service
public class TaskService {

    private final Firestore db;

    public TaskService(FirebaseService firebaseService) {
        this.db = firebaseService.getFirestore();
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

        db.collection("projects")
                .document(projectId)
                .collection("tasks")
                .document(taskId)
                .set(task)
                .get();

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
    }

    // Delete a task by its ID
    public void deleteTask(String projectId, String taskId) throws ExecutionException, InterruptedException {
        db.collection("projects").document(projectId).collection("tasks")
                .document(taskId).delete().get();
    }
}
