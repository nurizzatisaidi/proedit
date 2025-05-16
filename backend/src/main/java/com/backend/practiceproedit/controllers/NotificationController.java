package com.backend.practiceproedit.controllers;

import com.backend.practiceproedit.model.Notification;
import com.backend.practiceproedit.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@PathVariable String userId) {
        try {
            List<Map<String, Object>> notifications = notificationService.getNotificationsByUserId(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Create new notification
    @PostMapping("/create")
    public ResponseEntity<String> createNotification(@RequestBody Notification notification) {
        try {
            String id = notificationService.createNotification(notification);
            return ResponseEntity.ok("Notification created with ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create notification");
        }
    }

    // Mark as read
    @PutMapping("/mark-read/{notificationId}")
    public ResponseEntity<String> markAsRead(@PathVariable String notificationId) {
        boolean success = notificationService.markAsRead(notificationId);
        return success
                ? ResponseEntity.ok("Notification marked as read")
                : ResponseEntity.status(500).body("Failed to update notification");
    }

    // Delete a notification
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable String notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete notification");
        }
    }

}
