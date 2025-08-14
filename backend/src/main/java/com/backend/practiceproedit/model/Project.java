package com.backend.practiceproedit.model;

import java.util.List;

public class Project {
    private String projectId;
    private String title;
    private String status;
    private String videoType;
    private Integer duration;
    private String sharedDrive;
    private String notes;
    private String userId;
    private String username;
    // private String editorId;
    private List<String> editorIds;
    // private String editorUsername;
    private List<String> editorUsernames;
    private String privateDrive;
    private String reuqestId;

    public Project() {
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVideoType() {
        return videoType;
    }

    public void setVideoType(String videoType) {
        this.videoType = videoType;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getSharedDrive() {
        return sharedDrive;
    }

    public void setSharedDrive(String sharedDrive) {
        this.sharedDrive = sharedDrive;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // public String getEditorId() {
    // return editorId;
    // }

    // public void setEditorId(String editorId) {
    // this.editorId = editorId;
    // }

    // public String getEditorUsername() {
    // return editorUsername;
    // }

    // public void setEditorUsername(String editorUsername) {
    // this.editorUsername = editorUsername;
    // }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPrivateDrive() {
        return privateDrive;
    }

    public void setPrivateDrive(String privateDrive) {
        this.privateDrive = privateDrive;
    }

    public List<String> getEditorIds() {
        return editorIds;
    }

    public void setEditorIds(List<String> editorIds) {
        this.editorIds = editorIds;
    }

    public List<String> getEditorUsernames() {
        return editorUsernames;
    }

    public void setEditorUsernames(List<String> editorUsernames) {
        this.editorUsernames = editorUsernames;
    }

    public String getReuqestId() {
        return reuqestId;
    }

    public void setReuqestId(String reuqestId) {
        this.reuqestId = reuqestId;
    }

}
