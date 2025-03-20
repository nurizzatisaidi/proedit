package com.backend.practiceproedit.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.cloud.Timestamp;

public class Request {
    private String requestId;
    private String userId;
    private String title;
    private String videoType;
    private int duration;
    private String sharedDrive;
    private String notes;
    private String status;

    @JsonProperty("createdAt")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Timestamp createdAt;

    // ✅ REQUIRED: No-argument constructor (Fixes Firestore deserialization issue)
    public Request() {
    }

    public Request(String requestId, String userId, String title, String videoType, int duration, String sharedDrive,
            String notes, String status, Timestamp createdAt) {
        this.requestId = requestId;
        this.userId = userId;
        this.title = title;
        this.videoType = videoType;
        this.duration = duration;
        this.sharedDrive = sharedDrive;
        this.notes = notes;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getVideoType() {
        return videoType;
    }

    public void setVideoType(String videoType) {
        this.videoType = videoType;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public String getSharedDrive() {
        return sharedDrive;
    }

    public void setSharedDrive(String sharedDrive) {
        this.sharedDrive = sharedDrive;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

}
