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

            // Collect all unique user IDs and project IDs
            Set<String> userIds = new HashSet<>();
            Set<String> projectIds = new HashSet<>();

            for (Chat chat : chats) {
                userIds.addAll(chat.getParticipantIds());
                projectIds.add(chat.getProjectId());
            }

            // Batch fetch users
            Map<String, String> usernamesMap = firebaseService.getUsernamesByIds(userIds);

            // Batch fetch projects
            Map<String, String> projectTitlesMap = firebaseService.getProjectTitlesByIds(projectIds);

            for (Chat chat : chats) {
                Map<String, Object> chatMap = new HashMap<>();
                chatMap.put("chatId", chat.getChatId());
                chatMap.put("projectId", chat.getProjectId());
                chatMap.put("participantIds", chat.getParticipantIds());

                List<String> usernames = new ArrayList<>();
                for (String id : chat.getParticipantIds()) {
                    usernames.add(usernamesMap.getOrDefault(id, "Unknown"));
                }

                chatMap.put("participantUsernames", usernames);
                chatMap.put("projectTitle", projectTitlesMap.getOrDefault(chat.getProjectId(), "Untitled Project"));

                enrichedChats.add(chatMap);
            }

            return ResponseEntity.ok(enrichedChats);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Lightweight endpoint to fetch only the project title by chatId
    @GetMapping("/chat-title/{chatId}")
    public ResponseEntity<String> getChatTitle(@PathVariable String chatId) {
        try {
            DocumentSnapshot chat = firebaseService.getFirestore().collection("chats").document(chatId).get().get();
            if (chat.exists()) {
                String projectId = chat.getString("projectId");
                String title = firebaseService.getProjectTitleById(projectId);
                return ResponseEntity.ok(title != null ? title : "Untitled Project");
            } else {
                return ResponseEntity.ok("Chat");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error");
        }
    }

    // Get all the chats for Admin
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllChats() {
        try {
            List<Chat> chats = chatService.getAllChats();
            List<Map<String, Object>> enrichedChats = new ArrayList<>();

            // Collect all unique user IDs and project IDs
            Set<String> userIds = new HashSet<>();
            Set<String> projectIds = new HashSet<>();

            for (Chat chat : chats) {
                userIds.addAll(chat.getParticipantIds());
                projectIds.add(chat.getProjectId());
            }

            // Batch fetch usernames and the project titles
            Map<String, String> usernamesMap = firebaseService.getUsernamesByIds(userIds);
            Map<String, String> projectTitlesMap = firebaseService.getProjectTitlesByIds(projectIds);

            for (Chat chat : chats) {
                Map<String, Object> chatMap = new HashMap<>();
                chatMap.put("chatId", chat.getChatId());
                chatMap.put("projectId", chat.getProjectId());
                chatMap.put("participantIds", chat.getParticipantIds());

                List<String> usernames = new ArrayList<>();
                for (String id : chat.getParticipantIds()) {
                    usernames.add(usernamesMap.getOrDefault(id, "Unknown"));
                }

                chatMap.put("participantUsernames", usernames);
                chatMap.put("projectTitle", projectTitlesMap.getOrDefault(chat.getProjectId(), "Untitled Project"));

                enrichedChats.add(chatMap);
            }

            return ResponseEntity.ok(enrichedChats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get all the chats based on projectId
    @GetMapping("/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getChatByProjectId(@PathVariable String projectId) {
        try {
            Chat chat = chatService.getChatByProjectId(projectId);

            if (chat == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Chat not found"));
            }

            Map<String, Object> chatMap = new HashMap<>();
            chatMap.put("chatId", chat.getChatId());
            chatMap.put("projectId", chat.getProjectId());
            chatMap.put("participantIds", chat.getParticipantIds());

            return ResponseEntity.ok(chatMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching chat by projectId"));
        }
    }

}
