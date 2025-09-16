package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Chat;
import com.backend.practiceproedit.service.ChatService;
import com.backend.practiceproedit.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import org.springframework.http.HttpStatus;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/chats")
// @CrossOrigin(origins = "http://localhost:3000")
// @CrossOrigin(origins = "https://proedit-399a8.web.app")
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
            Map<String, String> projectTitlesMap = firebaseService.getProjectTitlesByIds(new ArrayList<>(projectIds)); // ✅

            Firestore fs = firebaseService.getFirestore();

            for (Chat chat : chats) {
                Map<String, Object> chatMap = new HashMap<>();
                chatMap.put("chatId", chat.getChatId());
                // chatMap.put("projectId", chat.getProjectId());
                chatMap.put("participantIds", chat.getParticipantIds());

                // usernames
                List<String> usernames = new ArrayList<>();
                for (String id : chat.getParticipantIds()) {
                    usernames.add(usernamesMap.getOrDefault(id, "Unknown"));
                }
                chatMap.put("participantUsernames", usernames);

                // type of chat
                String type = null;
                try {
                    // get the row doc to read type
                    DocumentSnapshot raw = firebaseService.getFirestore().collection("chats").document(chat.getChatId())
                            .get().get();
                    type = raw.getString("type");
                } catch (Exception ignore) {
                }
                chatMap.put("type", type);

                // compute the title
                if ("dm".equalsIgnoreCase(type)) {
                    // if DM, the title is the username
                    String meId = userId;
                    String myName = usernamesMap.getOrDefault(meId, "");
                    List<String> others = new ArrayList<>(usernames);
                    others.clear();
                    for (String pid : chat.getParticipantIds()) {
                        if (!pid.equals(meId)) {
                            others.add(usernamesMap.getOrDefault(pid, "Unknown"));
                        }
                    }
                    chatMap.put("title", others.isEmpty() ? "Direct Message" : others.get(0));

                    // to have return the other user id, helpful in the UI
                    String otherUserId = chat.getParticipantIds().stream().filter(pid -> !pid.equals(meId)).findFirst()
                            .orElse(null);
                    chatMap.put("otherUserId", otherUserId);

                } else {
                    // Group/Project chat : keep the project title
                    String projectTitle = projectTitlesMap.getOrDefault(chat.getProjectId(), "Untitles Project");
                    chatMap.put("title", projectTitle);
                    chatMap.put("projectId", chat.getProjectId());
                }

                // // project title
                // chatMap.put("projectTitle",
                // projectTitlesMap.getOrDefault(chat.getProjectId(), "Untitled Project"));

                // // Last messages (content + senderUsername + timestamp)
                QuerySnapshot lastMsgSnap = fs.collection("chats").document(chat.getChatId()).collection("messages")
                        .orderBy("timestamp", Query.Direction.DESCENDING).limit(1).get().get();

                String lastMessage = null, lastMessageSender = null;
                Date lastMessageAt = null;

                if (!lastMsgSnap.isEmpty()) {
                    DocumentSnapshot m = lastMsgSnap.getDocuments().get(0);
                    lastMessage = m.getString("content");
                    lastMessageSender = m.getString("senderUsername");
                    Timestamp ts = m.getTimestamp("timestamp");
                    if (ts != null)
                        lastMessageAt = ts.toDate();
                }

                chatMap.put("lastMessage", lastMessage);
                chatMap.put("lastMessageSender", lastMessageSender);
                chatMap.put("lastMessageAt", lastMessageAt);
                enrichedChats.add(chatMap);
            }

            return ResponseEntity.ok(enrichedChats);

        } catch (Exception e) {
            e.printStackTrace();
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
            Set<String> userIds = new HashSet<>();
            Set<String> projectIds = new HashSet<>();

            for (Chat chat : chats) {
                userIds.addAll(chat.getParticipantIds());
                projectIds.add(chat.getProjectId());
            }
            Map<String, String> usernamesMap = firebaseService.getUsernamesByIds(userIds);
            Map<String, String> projectTitlesMap = firebaseService.getProjectTitlesByIds(new ArrayList<>(projectIds)); // ✅

            for (Chat chat : chats) {
                Map<String, Object> chatMap = new HashMap<>();
                chatMap.put("chatId", chat.getChatId());
                chatMap.put("projectId", chat.getProjectId());
                chatMap.put("participantIds", chat.getParticipantIds());

                // usernames
                List<String> usernames = new ArrayList<>();
                for (String id : chat.getParticipantIds()) {
                    usernames.add(usernamesMap.getOrDefault(id, "Unknown"));
                }
                chatMap.put("participantUsernames", usernames);

                // project title
                chatMap.put("projectTitle", projectTitlesMap.getOrDefault(chat.getProjectId(), "Untitled Project"));

                // Get the latest message (text + timestamp + sender)
                Firestore fs = firebaseService.getFirestore();
                QuerySnapshot lastMsgSnap = fs.collection("chats")
                        .document(chat.getChatId()).collection("messages")
                        .orderBy("timestamp", Query.Direction.DESCENDING).limit(1).get().get();

                String lastMessage = null;
                Date lastMessageAt = null;
                String lastMessageSender = null;

                if (!lastMsgSnap.isEmpty()) {
                    DocumentSnapshot m = lastMsgSnap.getDocuments().get(0);
                    lastMessage = m.getString("content");
                    Timestamp ts = m.getTimestamp("timestamp");
                    if (ts != null)
                        lastMessageAt = ts.toDate();

                    lastMessageSender = m.getString("senderUsername");
                }

                chatMap.put("lastMessage", lastMessage);
                chatMap.put("lastMessageAt", lastMessageAt);
                chatMap.put("lastMessageSender", lastMessageSender);

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

    @PostMapping("direct")
    public ResponseEntity<Map<String, Object>> gotOrCreateDirectChat(@RequestBody Map<String, String> body) {
        try {
            String me = body.get("userA");
            String other = body.get("userB");
            String chatId = chatService.getOrCreateDirectChat(me, other);
            return ResponseEntity.ok(Map.of("chatId", chatId));
        } catch (IllegalArgumentException illegalArgumentException) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", illegalArgumentException.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create or fetch direct chat"));
        }
    }
}
