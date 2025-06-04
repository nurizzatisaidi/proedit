package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/messages")
// @CrossOrigin(origins = "http://localhost:3000")
// @CrossOrigin(origins = "https://proedit-399a8.web.app")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> payload) {
        try {
            String chatId = (String) payload.get("chatId");
            String senderId = (String) payload.get("senderId");
            String content = (String) payload.get("content");

            // Optional file metadata
            String fileUrl = (String) payload.get("fileUrl");
            String fileType = (String) payload.get("fileType");
            String fileName = (String) payload.get("fileName");

            Map<String, Object> message = messageService.createMessage(chatId, senderId, content, fileUrl, fileType,
                    fileName);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // GET: Retrieve messages for a chat
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable String chatId) {
        try {
            List<Map<String, Object>> messages = messageService.getMessagesByChatId(chatId);

            Map<String, Object> response = new HashMap<>();
            response.put("messages", messages);
            return ResponseEntity.ok(response);

        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
