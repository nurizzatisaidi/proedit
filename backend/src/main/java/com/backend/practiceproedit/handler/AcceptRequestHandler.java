package com.backend.practiceproedit.handler;

import java.util.HashMap;
import java.util.Map;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;

public class AcceptRequestHandler implements RequestHandler {
    @Override
    public void handleRequest(Firestore db, Request request) throws Exception {
        request.setStatus("Accepted");
        db.collection("requests").document(request.getRequestId())
                .update("status", "Accepted", "adminComment", request.getAdminComment(), "assignedEditor",
                        request.getAssignedEditor(), "assignedEditorUsername", request.getAssignedEditorUsername());

        // Create a new project in Firestore when a request is accepted
        DocumentReference newProjectRef = db.collection("projects").document(); // Explicitly create a document
        String newProjectId = newProjectRef.getId(); // Capture the generated ID

        // Creating a new project in Firestore when a request is accepted
        Map<String, Object> project = new HashMap<>();
        project.put("projectId", newProjectId); // Store the project ID
        project.put("title", request.getTitle());
        project.put("videoType", request.getVideoType());
        project.put("duration", request.getDuration());
        project.put("sharedDrive", request.getSharedDrive());
        project.put("notes", request.getNotes());
        project.put("userId", request.getUserId());
        project.put("username", request.getUsername());
        project.put("editorId", request.getAssignedEditor());
        project.put("editorUsername", request.getAssignedEditorUsername());
        project.put("status", "In Progress");
        project.put("requestId", request.getRequestId());

        // db.collection("projects").add(project);
        newProjectRef.set(project);

    }

}
