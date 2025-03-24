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

    // Method to delete a project by Id
    public boolean deleteProjectById(String projectId) throws ExecutionException, InterruptedException {
        Firestore db = firebaseService.getFirestore();

        DocumentReference docRef = db.collection("projects").document(projectId);

        if (docRef.get().get().exists()) {
            docRef.delete();
            return true;
        }
        return false;
    }

}
