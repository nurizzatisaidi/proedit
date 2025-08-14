
package com.backend.practiceproedit.handler;

import com.backend.practiceproedit.model.Notification;
import com.backend.practiceproedit.model.Request;
import com.backend.practiceproedit.model.Chat;
import com.backend.practiceproedit.service.NotificationService;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;

import java.util.*;

public class AcceptRequestHandler implements RequestHandler {

        private final NotificationService notificationService;

        public AcceptRequestHandler(NotificationService notificationService) {
                this.notificationService = notificationService;
        }

        @Override
        public void handleRequest(Firestore db, Request request) throws Exception {
                // 1. Update request
                db.collection("requests").document(request.getRequestId())
                                .update("status", "Accepted", "adminComment", request.getAdminComment(),
                                                "assignedEditor", request.getAssignedEditors(),
                                                "assignedEditorUsername", request.getAssignedEditorUsernames());

                // 2. Create Project
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
                project.put("editorId", request.getAssignedEditors());
                project.put("editorUsername", request.getAssignedEditorUsernames());
                project.put("status", "In Progress");
                project.put("requestId", request.getRequestId());

                newProjectRef.set(project);

                // Create chat with all participants
                List<String> participantIds = new ArrayList<>(request.getAssignedEditors());
                participantIds.add(request.getUserId());
                participantIds.add(request.getAdminUserId());

                DocumentReference newChatRef = db.collection("chats").document();
                Chat newChat = new Chat();
                newChat.setChatId(newChatRef.getId());
                newChat.setProjectId(newProjectId);
                newChat.setParticipantIds(participantIds);

                newChatRef.set(newChat);

                for (int i = 0; i < request.getAssignedEditors().size(); i++) {
                        String editorId = request.getAssignedEditors().get(i);
                        String editorName = request.getAssignedEditorUsernames().get(i);
                        Notification editorNotif = new Notification(
                                        editorId,
                                        "request",
                                        "You’ve been assigned to a new project: " + request.getTitle(),
                                        request.getRequestId(),
                                        false,
                                        Timestamp.now());
                        notificationService.createNotification(editorNotif);
                }

                // // 3. Create Chat
                // DocumentReference newChatRef = db.collection("chats").document();
                // Chat newChat = new Chat();
                // newChat.setChatId(newChatRef.getId());
                // newChat.setProjectId(newProjectId);
                // newChat.setParticipantIds(Arrays.asList(
                // request.getUserId(),
                // request.getAssignedEditors(),
                // request.getAdminUserId()));
                // newChatRef.set(newChat);

                // // 4. Notifications
                // Notification clientNotif = new Notification(
                // request.getUserId(), "request",
                // "Your request has been accepted.",
                // request.getRequestId(), false, Timestamp.now());

                // Notification editorNotif = new Notification(
                // request.getAssignedEditors(), "request",
                // "You’ve been assigned to a new project: " + request.getTitle(),
                // request.getRequestId(), false, Timestamp.now());

                // notificationService.createNotification(clientNotif);
                // notificationService.createNotification(editorNotif);

        }
}
