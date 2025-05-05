package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // POST: Send message
    // @PostMapping("/send")
    // public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody
    // Map<String, String> payload) {
    // try {
    // String chatId = payload.get("chatId");
    // String senderId = payload.get("senderId");
    // String content = payload.get("content");

    // Map<String, Object> message = messageService.createMessage(chatId, senderId,
    // content);
    // return ResponseEntity.ok(message);
    // } catch (Exception e) {
    // return ResponseEntity.status(500).body(null);
    // }
    // }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, String> payload) {
        try {
            String chatId = payload.get("chatId");
            String senderId = payload.get("senderId");
            String content = payload.get("content");

            // Optional file metadata
            String fileUrl = payload.get("fileUrl");
            String fileType = payload.get("fileType");
            String fileName = payload.get("fileName");

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
