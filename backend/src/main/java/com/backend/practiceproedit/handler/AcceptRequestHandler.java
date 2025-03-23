package com.backend.practiceproedit.handler;

import java.util.HashMap;
import java.util.Map;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.firestore.Firestore;

public class AcceptRequestHandler implements RequestHandler {
    @Override
    public void handleRequest(Firestore db, Request request) throws Exception {
        request.setStatus("Accepted");
        db.collection("requests").document(request.getRequestId())
                .update("status", "Accepted", "adminComment", request.getAdminComment(), "assignedEditor",
                        request.getAssignedEditor(), "assignedEditorUsername", request.getAssignedEditorUsername());

        // Creating a new project in Firestore when a request is accepted
        Map<String, Object> project = new HashMap<>();
        project.put("title", request.getTitle());
        project.put("videoType", request.getVideoType());
        project.put("duration", request.getDuration());
        project.put("userId", request.getUserId());
        project.put("username", request.getUsername());
        project.put("editorId", request.getAssignedEditor());
        project.put("editorUsername", request.getAssignedEditorUsername());
        project.put("status", "In Progress");

        db.collection("projects").add(project);

    }

}
