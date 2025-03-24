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

    public ProjectService(FirebaseService firebaseService) {
        this.db = firebaseService.getFirestore();
    }

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
}
