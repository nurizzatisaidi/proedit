package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Project;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;
import com.backend.practiceproedit.model.Notification;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Date;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import com.google.cloud.Timestamp;

@Service
public class ProjectService {

    @Autowired
    private NotificationService notificationService;

    private final Firestore db;
    private final FirebaseService firebaseService;

    public ProjectService(FirebaseService firebaseService) {
        this.db = firebaseService.getFirestore();
        this.firebaseService = firebaseService;
    }

    // Method to get All projects
    public List<Project> getAllProjects() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("projects").get();
        QuerySnapshot snapshot = future.get(); // ✅ correct
        List<QueryDocumentSnapshot> documents = snapshot.getDocuments();

        List<Project> projects = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Project project = document.toObject(Project.class);
            project.setProjectId(document.getId());

            CollectionReference paymentsRef = document.getReference().collection("payments");
            QuerySnapshot paymentSnapshot = paymentsRef.get().get();

            for (QueryDocumentSnapshot paymentDoc : paymentSnapshot.getDocuments()) {
                String status = paymentDoc.getString("status");
                if ("pending_client_payment".equalsIgnoreCase(status)) {
                    project.setStatus("Pending Payment");
                    break;
                }
            }

            projects.add(project);
        }
        return projects;
    }

    // Method to get the Project by editor's Id
    public List<Project> getProjectsByEditorId(String editorId) throws ExecutionException, InterruptedException {
        Query query = db.collection("projects").whereEqualTo("editorId", editorId);
        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Project> projects = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Project project = document.toObject(Project.class);
            project.setProjectId(document.getId()); // Add Firestore doc ID
            projects.add(project);
        }
        return projects;
    }

    // Method to delete a project by Id and its associated request
    public boolean deleteProjectById(String projectId) {
        try {
            db.runTransaction(transaction -> {
                DocumentReference projectRef = db.collection("projects").document(projectId);
                DocumentSnapshot projectSnapshot = transaction.get(projectRef).get();

                if (projectSnapshot.exists()) {
                    // Extract the requestId from the project document
                    String requestId = projectSnapshot.getString("requestId");
                    // Delete the project document
                    transaction.delete(projectRef);

                    // If a requestId exists, delete the associated request
                    if (requestId != null && !requestId.isEmpty()) {
                        DocumentReference requestRef = db.collection("requests").document(requestId);
                        transaction.delete(requestRef);
                    }
                    return null; // Returning null from the transaction function signifies success
                } else {
                    throw new RuntimeException("No such project exists!");
                }
            });
            return true;
        } catch (Exception e) {
            System.out.println("Transaction failure: " + e);
            return false;
        }
    }

    // Method to update project information
    public Project updateProject(String projectId, Project updatedProject)
            throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection("projects").document(projectId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();

        if (document.exists()) {
            Project existingProject = document.toObject(Project.class);

            if (updatedProject.getTitle() != null)
                existingProject.setTitle(updatedProject.getTitle());
            if (updatedProject.getVideoType() != null)
                existingProject.setVideoType(updatedProject.getVideoType());
            if (updatedProject.getDuration() != null)
                existingProject.setDuration(updatedProject.getDuration());
            if (updatedProject.getNotes() != null)
                existingProject.setNotes(updatedProject.getNotes());
            if (updatedProject.getEditorUsername() != null)
                existingProject.setEditorUsername(updatedProject.getEditorUsername());
            if (updatedProject.getStatus() != null)
                existingProject.setStatus(updatedProject.getStatus());
            if (updatedProject.getSharedDrive() != null)
                existingProject.setSharedDrive(updatedProject.getSharedDrive());
            if (updatedProject.getPrivateDrive() != null)
                existingProject.setPrivateDrive(updatedProject.getPrivateDrive());

            docRef.set(existingProject);
            return existingProject;
        }

        return null;
    }

    // Method to create a new project
    public String findUsernameByUserId(String userId) throws ExecutionException, InterruptedException {
        DocumentSnapshot userDoc = db.collection("users").document(userId).get().get();
        System.out.println("User Document: " + userDoc.getData());
        return userDoc.exists() ? userDoc.getString("name") : null;
    }

    public String findUsernameByEditorId(String editorId) throws ExecutionException, InterruptedException {
        DocumentSnapshot editorDoc = db.collection("users").document(editorId).get().get();
        System.out.println("Editor Document: " + editorDoc.getData());
        return editorDoc.exists() ? editorDoc.getString("name") : null;
    }

    public Project createProject(Project newProject) throws ExecutionException, InterruptedException {
        String clientUsername = findUsernameByUserId(newProject.getUserId());
        String editorUsername = findUsernameByEditorId(newProject.getEditorId());

        System.out.println("Client Username: " + clientUsername + ", Editor Username: " + editorUsername);

        newProject.setUsername(clientUsername);
        newProject.setEditorUsername(editorUsername);
        newProject.setStatus("In Progress");

        DocumentReference docRef = db.collection("projects").document();
        newProject.setProjectId(docRef.getId());
        ApiFuture<WriteResult> result = docRef.set(newProject);
        result.get();
        return newProject;
    }

    // Method to get Projects by Client User Id
    public List<Project> getProjectsByClientId(String userId) throws ExecutionException, InterruptedException {
        Query query = db.collection("projects").whereEqualTo("userId", userId);
        ApiFuture<QuerySnapshot> future = query.get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Project> projects = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Project project = document.toObject(Project.class);
            project.setProjectId(document.getId()); // Add Firestore doc ID
            projects.add(project);
        }
        return projects;
    }

    // Method to create chat when project is assigned
    public String createChat(String projectId, String adminId, String editorId, String clientId) {
        DocumentReference chatRef = db.collection("chats").document();
        Map<String, Object> chat = new HashMap<>();
        chat.put("chatId", chatRef.getId());
        chat.put("participants", Arrays.asList(adminId, editorId, clientId));
        chat.put("createdDate", Timestamp.now());
        chatRef.set(chat);
        return chatRef.getId();
    }

    // Get Project by its ProjectId
    public Project getProjectById(String projectId) {
        try {
            return firebaseService.getProjectById(projectId);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Project> getProjectsWithPendingPaymentStatus() throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        List<Project> result = new ArrayList<>();

        ApiFuture<QuerySnapshot> projectQuery = db.collection("projects").get();
        List<QueryDocumentSnapshot> projectDocs = projectQuery.get().getDocuments();

        for (QueryDocumentSnapshot projectDoc : projectDocs) {
            Project project = projectDoc.toObject(Project.class);
            project.setProjectId(projectDoc.getId());

            // Check for 'pending_client_payment' in payments subcollection
            CollectionReference paymentsRef = projectDoc.getReference().collection("payments");
            QuerySnapshot paymentsSnapshot = paymentsRef.get().get();

            for (QueryDocumentSnapshot paymentDoc : paymentsSnapshot.getDocuments()) {
                String status = paymentDoc.getString("status");
                if ("pending_client_payment".equalsIgnoreCase(status)) {
                    project.setStatus("Completed - Pending Payment"); // Optional override for chart display
                    break;
                }
            }

            result.add(project);
        }

        return result;
    }

    // Chaneg Project status when all payments are paid
    public void updateProjectStatusIfAllPaymentsPaid(String projectId) throws Exception {
        DocumentReference projectRef = db.collection("projects").document(projectId);
        CollectionReference paymentsRef = projectRef.collection("payments");

        // Get all payments for the project
        List<QueryDocumentSnapshot> paymentDocs = paymentsRef.get().get().getDocuments();

        if (paymentDocs.isEmpty()) {
            return; // No payments yet, do not update status
        }

        boolean allPaid = true;
        for (QueryDocumentSnapshot paymentDoc : paymentDocs) {
            String status = paymentDoc.getString("status");
            if (!"paid".equalsIgnoreCase(status)) {
                allPaid = false;
                break;
            }
        }

        if (allPaid) {
            projectRef.update("status", "Completed Payment");
        }
    }

    public void updateProjectStatusIfChanged(String projectId, String newStatus)
            throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference projectRef = db.collection("projects").document(projectId);
        DocumentSnapshot projectDoc = projectRef.get().get();

        String currentStatus = projectDoc.getString("status");
        if (!newStatus.equals(currentStatus)) {
            // Update the status
            projectRef.update("status", newStatus);

            // Notify admins if status changed to "To Review"
            if ("To Review".equals(newStatus)) {
                String projectTitle = projectDoc.getString("title");
                String clientUsername = projectDoc.getString("username"); // optional if needed

                List<QueryDocumentSnapshot> admins = db.collection("users")
                        .whereEqualTo("role", "admin")
                        .get()
                        .get()
                        .getDocuments();

                for (QueryDocumentSnapshot admin : admins) {
                    Notification notification = new Notification();
                    notification.setUserId(admin.getId());
                    notification.setType("project");
                    notification.setMessage("Project \"" + projectTitle + "\" has been submitted for review.");
                    notification.setRelatedId(projectId);
                    notification.setRead(false);
                    notification.setTimestamp(com.google.cloud.Timestamp.now());

                    // You may autowire or access your NotificationService to save it
                    notificationService.createNotification(notification);
                }
            }
        }
    }

}
