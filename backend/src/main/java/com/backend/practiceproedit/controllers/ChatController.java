package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Chat;
import com.backend.practiceproedit.service.ChatService;
import com.backend.practiceproedit.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.cloud.firestore.DocumentSnapshot;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private FirebaseService firebaseService;

    // Get all chats where the user is a participant
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserChats(@PathVariable String userId) {
        try {
            List<Chat> chats = chatService.getChatsByUserId(userId);
            List<Map<String, Object>> enrichedChats = new ArrayList<>();

            for (Chat chat : chats) {
                Map<String, Object> chatMap = new HashMap<>();
                chatMap.put("chatId", chat.getChatId());
                chatMap.put("projectId", chat.getProjectId());
                chatMap.put("participantIds", chat.getParticipantIds());

                // Convert participant IDs to usernames
                List<String> usernames = new ArrayList<>();
                for (String id : chat.getParticipantIds()) {
                    String name = firebaseService.getUsernameById(id); // assumes this method exists
                    usernames.add(name != null ? name : "Unknown");
                }

                chatMap.put("participantUsernames", usernames);

                // Fetch project title
                DocumentSnapshot projectDoc = firebaseService.getFirestore()
                        .collection("projects").document(chat.getProjectId()).get().get();

                if (projectDoc.exists()) {
                    String projectTitle = projectDoc.getString("title");
                    chatMap.put("projectTitle", projectTitle != null ? projectTitle : "Untitled Project");
                } else {
                    chatMap.put("projectTitle", "Untitled Project");
                }

                enrichedChats.add(chatMap);
            }

            return ResponseEntity.ok(enrichedChats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
