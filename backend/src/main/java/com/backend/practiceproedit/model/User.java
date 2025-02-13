package com.backend.practiceproedit.model;

public class User {
    private String userId;
    private String name;
    private String email;
    private String password;
    private String role;
    private String photoUrl; // Add this field

    // Default constructor
    public User() {
    }

    // Constructor with parameters
    public User(String userId, String name, String email, String password, String role) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhotoUrl() { // Getter for photoUrl
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) { // Setter for photoUrl
        this.photoUrl = photoUrl;
    }
}
