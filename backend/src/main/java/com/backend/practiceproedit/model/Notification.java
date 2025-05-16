package com.backend.practiceproedit.model;

import com.google.cloud.Timestamp;

public class Notification {
    private String notificationId;
    private String userId;
    private String type; // e.g. "chat", "request", "task"
    private String message;
    private String relatedId; // projectId, requestId, or chatId
    private boolean read;
    private Timestamp timestamp;

    public Notification() {
    }

    public Notification(String userId, String type, String message, String relatedId, boolean read,
            Timestamp timestamp) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.relatedId = relatedId;
        this.read = read;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }
}
