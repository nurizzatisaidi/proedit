package com.backend.practiceproedit.handler;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

import com.backend.practiceproedit.model.Request;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.backend.practiceproedit.model.Chat;

public class AcceptRequestHandler implements RequestHandler {
    @Override
    public void handleRequest(Firestore db, Request request) throws Exception {
        request.setStatus("Accepted");
        db.collection("requests").document(request.getRequestId())
                .update("status", "Accepted", "adminComment", request.getAdminComment(), "assignedEditor",
                        request.getAssignedEditor(), "assignedEditorUsername", request.getAssignedEditorUsername());

        // Create a new project in Firestore when a request is accepted
        DocumentReference newProjectRef = db.collection("projects").document();
        String newProjectId = newProjectRef.getId();

        Map<String, Object> project = new HashMap<>();
        project.put("projectId", newProjectId);
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

        // Create a new chat in Firestore when a request is accepted
        DocumentReference newChatRef = db.collection("chats").document();
        Chat newChat = new Chat();
        newChat.setChatId(newChatRef.getId());
        newChat.setProjectId(newProjectId);

        // ✅ Use the actual adminUserId from request
        String adminUserId = request.getAdminUserId();

        newChat.setParticipantIds(Arrays.asList(request.getUserId(), request.getAssignedEditor(), adminUserId));

        newChatRef.set(newChat);

    }

}
