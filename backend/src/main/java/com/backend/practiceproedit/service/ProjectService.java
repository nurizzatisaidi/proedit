package com.backend.practiceproedit.service;

import com.backend.practiceproedit.model.Project;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class ProjectService {

    private final Firestore db;
    private final FirebaseService firebaseService;

    public ProjectService(FirebaseService firebaseService) {
        this.db = firebaseService.getFirestore();
        this.firebaseService = firebaseService;
    }

    // Method to get All projects
    public List<Project> getAllProjects() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("projects").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        List<Project> projects = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            Project project = document.toObject(Project.class);
            project.setProjectId(document.getId()); // Add Firestore doc ID
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

            if (existingProject != null) {
                existingProject.setTitle(updatedProject.getTitle());
                existingProject.setVideoType(updatedProject.getVideoType());
                existingProject.setDuration(updatedProject.getDuration());
                existingProject.setNotes(updatedProject.getNotes());
                existingProject.setEditorUsername(updatedProject.getEditorUsername());
                existingProject.setStatus(updatedProject.getStatus());
                existingProject.setSharedDrive(updatedProject.getSharedDrive());
                existingProject.setPrivateDrive(updatedProject.getPrivateDrive());
            }

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
        chat.put("createdDate", new Timestamp(new Date()));
        chatRef.set(chat);
        return chatRef.getId();
    }
}
